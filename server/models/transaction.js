const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: String, default: 0 },
  quantity: { type: String },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  totalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Total",
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;
