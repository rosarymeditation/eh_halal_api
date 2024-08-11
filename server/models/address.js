const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  address: { type: String, required: true },
  postCode: { type: String, required: true },
  city: { type: String, required: true },
  isDefault: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const Address = mongoose.model("Address", addressSchema);

module.exports = Address;
