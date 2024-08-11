const mongoose = require("mongoose");

const suggestionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  desc: { type: String, required: true },
  category: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const Suggestion = mongoose.model("Suggestion", suggestionSchema);

module.exports = Suggestion;
