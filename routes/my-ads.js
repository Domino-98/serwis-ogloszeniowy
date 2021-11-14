const express = require("express");
const router = express.Router();
const Ad = require("../models/ad");

router.get("/", async (req, res) => {
  if (!req.user) {
    req.flash("error", "Musisz być zalogowany");
    return res.redirect("/");
  }
  const ads = await Ad.find({ author: { _id: req.user._id } }).populate(
    "author"
  );
  res.render("ads/my-ads", { ads });
});

module.exports = router;
