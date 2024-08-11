const mongoose = require("mongoose");
const Transaction = require("./transaction");
const totalSchema = new mongoose.Schema({
  transactionId: { type: String },
  day: { type: String },
  month: { type: String },
  year: { type: String },
  subTotal: { type: String, default: 0 },
  address: { type: String },
  message: { type: String },
  lng: { type: String },
  lat: { type: String },
  deliveryDay: { type: String },
  discount: { type: String },
  deliveryPrice: { type: String },
  total: { type: String },
  createdAt: { type: Date, default: Date.now },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Status",
  },
});

const Total = mongoose.model("Total", totalSchema);

module.exports = Total;
