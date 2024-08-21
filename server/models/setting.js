const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema({
  minOrder: { type: String, default: 10 },
  freeDeliveryAmount: { type: String, default: 0 },
  lastDeliveryHour: { type: String, default: "18:00" },
  deliveryStandard: { type: String, default: 3 },
  mileRadius: { type: String, default: 5 },
});

const Setting = mongoose.model("Setting", settingSchema);

module.exports = Setting;
