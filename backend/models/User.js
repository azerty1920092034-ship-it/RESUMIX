const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  googleId: String,
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: String,
  avatar: String,
  firstVisit: { type: Date, default: Date.now },
  trialEnds: { type: Date, default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) },
  isPro: { type: Boolean, default: false },
  proEnds: Date,
  dailyCount: { type: Number, default: 0 },
  lastReset: { type: String, default: () => new Date().toDateString() },
  resetCode: String,
  resetExpires: Date,
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);