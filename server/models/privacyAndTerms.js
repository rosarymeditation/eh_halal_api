const mongoose = require("mongoose");

const privacyAndTermsSchema = new mongoose.Schema({
  privacy: { type: String },
  terms: { type: String },
});

const PrivacyAndTerms = mongoose.model(
  "PrivacyAndTermsSchema",
  privacyAndTermsSchema
);

module.exports = PrivacyAndTerms;
