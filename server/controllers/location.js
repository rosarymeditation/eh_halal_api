// const PostCode = require("../models").PostCode;
// const Query = new require("../queries/crud");
// const validate = require("../validations/validation");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const Product = require("../models/product");
const { upload, rand } = require("../utility/global");
const mongoose = require("mongoose");
const {
  SERVER_ERROR,
  OK,
  VALIDATION_ERROR,
  Messages,
} = require("../errors/statusCode");
// const query = new Query(PostCode);
const freeGiftAmount = "45.00";
const flatFee = "6.00";
const localFee = "6.99"; // Fee Delivering within Edinburgh
const nextDayFee = "6.00"; // Next Day
const freeMile = "6.00"; // Distance that qualifies for free delivery
const maxMile = "15.00"; // miles that can deliver same day
const minOrder = "20.00"; // min order to qualify for free delivery
const freeDeliveryOrder = "90.00";
const lastDeliveryHour = "16";
module.exports = {
  getLocationParams: async (req, res) => {
    try {
      return res.status(OK).send({
        localFee: localFee,
        nextDayFee: nextDayFee,
        freeMile: freeMile,
        maxMile: maxMile,
        minOrder: minOrder,
        flatFee: flatFee,
        freeGiftAmount: freeGiftAmount,
        freeDeliveryOrder: freeDeliveryOrder,
        lastDeliveryHour: lastDeliveryHour,
      });
    } catch (err) {
      return res.status(SERVER_ERROR).send({ error: true, message: err });
    }
  },
};
