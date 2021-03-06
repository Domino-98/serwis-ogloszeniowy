if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const path = require("path");
const favicon = require("serve-favicon");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError");
const methodOverride = require("method-override");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const MongoDBStore = require("connect-mongo")(session);

const ads = require("./routes/ads");
const users = require("./routes/users");
const watched = require("./routes/watched");
const myAds = require("./routes/my-ads");

app.use(express.json());

const dbUrl =
  process.env.DB_URL || "mongodb://localhost:27017/serwis-ogloszeniowy";

mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

mongoose.set("useFindAndModify", false);
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(favicon(path.join(__dirname, "public", "images", "favicon.ico")));
app.use("/public", express.static("public"));
app.use("/node_modules", express.static("node_modules"));
app.use(mongoSanitize());

const store = new MongoDBStore({
  url: dbUrl,
  secret: process.env.SESSION_SECRET || "session secret key",
  touchAfter: 24 * 60 * 60,
});

store.on("error", function (e) {
  console.log("Session store error", e);
});

const sessionConfig = {
  store,
  name: "session",
  secret: process.env.SESSION_SECRET || "session secret key",
  resave: false,
  saveUninitialized: true,

  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

app.use(session(sessionConfig));
app.use(flash());
app.use(helmet({ contentSecurityPolicy: false }));

app.use(passport.initialize());
app.use(passport.session());
passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
    },
    User.authenticate()
  )
);

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

app.use("/", users);
app.use("/watched", watched);
app.use("/my-ads", myAds);
app.use("/", ads);

app.all("*", (req, res, next) => {
  next(new ExpressError("Nie znaleziono strony", 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Ups... Co?? posz??o nie tak";
  res.status(statusCode).render("error", { err });
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Serving on port ${port}`);
});
