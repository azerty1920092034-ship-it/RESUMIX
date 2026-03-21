const mongoose = require("mongoose");

const SummarySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  originalText: { type: String, required: true },
  summary: { type: String, required: true },
  language: { type: String, default: "fr" },
  wordCountOriginal: { type: Number },
  wordCountSummary: { type: Number },
  reductionPercent: { type: Number },
}, { timestamps: true });

module.exports = mongoose.model("Summary", SummarySchema);