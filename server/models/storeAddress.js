const mongoose = require("mongoose");

const storeAddressSchema = new mongoose.Schema({
  address: { type: String, required: true },
  postCode: { type: String, required: true },
  longitude: { type: String, required: true },
  latitude: { type: String, required: true },
  city: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "City",
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

const StoreAddress = mongoose.model("StoreAddress", storeAddressSchema);

module.exports = StoreAddress;
