const mongoose = require("mongoose");

const productReminderSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String },
  phone: { type: String },
  createdAt: { type: Date, default: Date.now },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
});

const ProductReminder = mongoose.model(
  "ProductReminder",
  productReminderSchema
);

module.exports = ProductReminder;
