const mongoose = require("mongoose");

const variationSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(), // Automatically generate a unique ID for each variation
  },
  serial: {
    type: Number,
    required: true, // e.g., 4 pieces
  },
  weightType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "WeightType",
    required: true,
  },
  quantity: {
    type: Number,
    required: true, // e.g., 4 pieces
  },
  canShow: { type: Boolean, default: true },
  isAvailable: {
    type: Boolean,
    default: true,
    required: true, // e.g., 4 pieces
  },

  price: {
    type: Number,
    required: true, // Price for the specified quantity
  },
});
const Variation = mongoose.model("Variation", variationSchema);

module.exports = Variation;
