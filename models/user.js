const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  resetPasswordToken: {
    type: String,
  },
  resetPasswordExpires: {
    type: Date,
  },
  watchedAds: [
    {
      type: Schema.Types.ObjectId,
      ref: "Ad",
    },
  ],
  isAdmin: {
    type: Boolean,
    required: true,
    default: false,
  },
});

UserSchema.plugin(passportLocalMongoose, { usernameField: "email" });

module.exports = mongoose.model("User", UserSchema);
