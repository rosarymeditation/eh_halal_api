const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  discountType: {
    type: String,
    required: true,
    enum: ["Percentage", "Fixed"],
  },
  discountValue: {
    type: Number,
    required: true,
    min: 0,
    validate: {
      validator: function (value) {
        if (this.discountType === "Percentage") {
          return value <= 100;
        }
        return true;
      },
      message: "Percentage discount must be between 0 and 100",
    },
  },
  expirationDate: {
    type: Date,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const CouponSchema = mongoose.model("CouponSchema", couponSchema);

module.exports = CouponSchema;
