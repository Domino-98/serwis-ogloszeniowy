const express = require("express");
const router = express.Router();
const async = require("async");
const catchAsync = require("../utils/catchAsync");
const passport = require("passport");
const User = require("../models/user");

const nodemailer = require("nodemailer");
global.crypto = require("crypto");

router.get("/register", (req, res) => {
  res.render("users/register");
});

router.post(
  "/register",
  catchAsync(async (req, res, next) => {
    const { email, username, password } = req.body;
    try {
      const user = new User({ email, username, password });
      const registeredUser = await User.register(user, password);
      req.login(registeredUser, (err) => {
        if (err) return next(err);
        req.flash("success", "Witaj w serwisie ogłoszeniowym ADBOX!");
        res.redirect("/");
      });
    } catch (e) {
      let msg = "";
      const foundUserEmail = await User.findOne({ email: email });
      const foundUserName = await User.findOne({ username: username });
      if (foundUserEmail) {
        msg = "Użytkownik o podanym mailu już istnieje";
      }
      if (foundUserName) {
        msg = "Użytkownik o podanej nazwie już istnieje";
      }
      req.flash("error", msg);
      res.redirect("register");
    }
  })
);

router.get("/login", (req, res) => {
  res.render("users/login");
});

router.post(
  "/login",
  passport.authenticate("local", {
    failureFlash: "Niepoprawny adres email lub hasło",
    failureRedirect: "/login",
  }),
  catchAsync(async (req, res) => {
    req.flash("success", "Witamy z powrotem!");
    const redirectUrl = req.session.returnTo || "/";
    delete req.session.returnTo;
    res.redirect(redirectUrl);
  })
);

router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success", "Zostałeś pomyślnie wylogowany");
  res.redirect("/");
});

// Password Reset
router.get("/forgot", (req, res) => {
  res.render("users/forgot");
});

router.post("/forgot", (req, res, next) => {
  async.waterfall(
    [
      function (done) {
        crypto.randomBytes(20, function (err, buf) {
          let token = buf.toString("hex");
          done(err, token);
        });
      },
      function (token, done) {
        User.findOne({ email: req.body.email }, function (err, user) {
          if (!user) {
            req.flash("error", "Konto o podanym adresie email nie istnieje");
            return res.redirect("/forgot");
          }

          user.resetPasswordToken = token;
          user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

          user.save(function (err) {
            done(err, token, user);
          });
        });
      },
      function (token, user, done) {
        let transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL,
            pass: process.env.PASS,
          },
        });
        let mailOptions = {
          to: user.email,
          from: process.env.EMAIL,
          subject: "Reset hasła - serwis ogłoszeniowy ADBOX",
          text: `
			Otrzymałeś tą wiadomość, dlatego że poprosiłeś (lub ktoś inny) o reset hasła na stronie podanej w temacie tego maila. Jeżeli to nie byłeś ty, zignoruj tego maila.
			Kliknij na link poniżej, jeżeli chcesz zmienić hasło.
			http://${req.headers.host}/reset/${token}
			`,
        };
        transporter.sendMail(mailOptions, function (err) {
          req.flash(
            "success",
            `Email z instrukcją resetu hasła został wysłany na adres ${user.email} `
          );
          done(err, "done");
        });
      },
    ],
    function (err) {
      if (err) return next(err);
      res.redirect("/forgot");
    }
  );
});

router.get("/reset/:token", (req, res) => {
  User.findOne(
    {
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() },
    },
    function (err, user) {
      if (!user) {
        req.flash(
          "error",
          "Token do zresetowania hasła jest niepoprawny bądź już wygasł"
        );
        return res.redirect("back");
      }
      res.render("users/reset", { token: req.params.token });
    }
  );
});

router.post("/reset/:token", (req, res) => {
  async.waterfall(
    [
      function (done) {
        User.findOne(
          {
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() },
          },
          function (err, user) {
            if (!user) {
              req.flash(
                "error",
                "Token do zresetowania hasła jest niepoprawny bądź już wygasł"
              );
              return res.redirect("back");
            }
            if (req.body.password === req.body.confirm) {
              user.setPassword(req.body.password, function (err) {
                user.resetPasswordToken = undefined;
                user.resetPasswordExpires = undefined;

                user.save(function (err) {
                  req.logIn(user, function (err) {
                    done(err, user);
                  });
                });
              });
            } else {
              req.flash("error", "Hasła do siebie nie pasują");
              return res.redirect("back");
            }
          }
        );
      },
      function (user, done) {
        let transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL,
            pass: process.env.PASS,
          },
        });
        let mailOptions = {
          to: user.email,
          from: process.env.USER,
          subject: "Twoje hasło zostało zmienione",
          text: `
            Witaj użytkowniku,
			Jest to potwierdzenie, że hasło dla twojego konta ${user.email} w serwisie ogłoszeniowym ADBOX zostało zmienione.
			`,
        };
        transporter.sendMail(mailOptions, function (err) {
          req.flash("success", "Twoje hasło zostało zmienione!");
          done(err);
        });
      },
    ],
    function (err) {
      res.redirect("/");
    }
  );
});

module.exports = router;
