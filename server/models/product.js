const mongoose = require("mongoose");
const VariationSchema = require("./variation").schema;
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: String },
  slug: { type: String },
  salePrice: { type: String, default: 0 },
  quantity: { type: Number, default: 0, required: false },
  serial: { type: Number, default: 0 },
  percentageDiscount: { type: Number, default: 0 },
  weight: { type: String, default: 0 },
  description: { type: String },
  isPopular: { type: Boolean, default: true },
  isLocal: { type: Boolean, default: false },
  canShow: { type: Boolean, default: true },
  // stock: {
  //   type: Number,
  //   default: 100,
  // },
  images: [{ type: mongoose.Schema.Types.ObjectId, ref: "Image" }],
  isAvailable: { type: Boolean, default: true },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  variations: [VariationSchema],
  weightType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "WeightType",
    required: false,
  },
});

productSchema.methods.getFinalPriceForVariation = function (variationPrice) {
  if (this.percentageDiscount == null || this.percentageDiscount == 0) {
    return 0;
  }
  const discountAmount = (variationPrice * this.percentageDiscount) / 100;
  return variationPrice - discountAmount;
};

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
