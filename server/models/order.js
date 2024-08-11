const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  amount: { type: String },
  quantity: { type: String },
  subTotal: { type: String },
  createdAt: { type: Date, default: Date.now },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
