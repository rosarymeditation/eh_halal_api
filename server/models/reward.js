const mongoose = require("mongoose");

const rewardSchema = new mongoose.Schema({
  points: {
    type: Number,
    required: true,
    default: 0,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const Reward = mongoose.model("Reward", rewardSchema);

module.exports = Reward;
