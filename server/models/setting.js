const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema({
  deliveryStandard: { type: String, default: 3 },
  deliveryPremium: { type: String, default: 4 },
  mileRadius: { type: String, default: 5 },
  isShowSalePercent: { type: Boolean, default: false },
  pricePerItem: { type: String, default: 0 },
});

const Setting = mongoose.model("Setting", settingSchema);

module.exports = Setting;
