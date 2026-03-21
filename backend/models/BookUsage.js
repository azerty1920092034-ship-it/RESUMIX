const mongoose = require("mongoose");

const BookUsageSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  bookTitle: { type: String, required: true },
  questionCount: { type: Number, default: 0 },
  lastReset: { type: String, default: () => new Date().toDateString() },
}, { timestamps: true });

module.exports = mongoose.model("BookUsage", BookUsageSchema);