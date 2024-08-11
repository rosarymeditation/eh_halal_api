const mongoose = require("mongoose");

const sessionTokenSchema = new mongoose.Schema({
  session: {
    type: String,
    required: true,
  },
});

const SessionToken = mongoose.model("SessionToken", sessionTokenSchema);

module.exports = SessionToken;
