// const PostCode = require("../models").PostCode;
// const Query = new require("../queries/crud");
// const validate = require("../validations/validation");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const {
  SERVER_ERROR,
  OK,
  FAILED_AUTH,
  VALIDATION_ERROR,
  Messages,
} = require("../errors/statusCode");
const jwt = require("jsonwebtoken");
// const query = new Query(PostCode);
const secret = process.env.SECRET;
const bcrypt = require("bcryptjs");
const { email1, email2 } = require("../utility/constants");
const { CapitalizeFirstLetter } = require("../utility/global");
const User = require("../models/user");
const ProductReminder = require("../models/productReminder");

module.exports = {
  reminder: async (req, res) => {
    const id = req.userData.id;
    const { productId } = req.body;

    try {
      const user = await User.findById(id);

      const checkDuplicate = await ProductReminder.findOne({
        product: productId,
        email: user.email,
      });

      if (checkDuplicate) {
        return res.status(SERVER_ERROR).send({ error: true });
      }

      const data = ProductReminder({
        name: user.firstname,
        email: user.email,
        product: productId,
      });

      await data.save();
      return res.status(OK).send({});
    } catch (err) {
      return res.status(SERVER_ERROR).send({ error: true });
    }
  },
  guestReminder: async (req, res) => {
    const { name, email, phone, productId } = req.body;

    try {
      const checkDuplicate = await ProductReminder.findOne({
        product: productId,
        email,
      });

      if (checkDuplicate) {
        return res.status(SERVER_ERROR).send({ error: true });
      }

      var data = await ProductReminder({
        name: name,
        email: email,
        phone: phone,
        product: productId,
      });

      await data.save();
      return res.status(OK).send(data);
    } catch (err) {
      console.log(err);
      return res.status(SERVER_ERROR).send({ error: true, message: err });
    }
  },

  findAll: async (req, res) => {
    try {
      const { page = 1, limit = 30 } = req.body;

      const data = await ProductReminder.find()
        .skip((page - 1) * limit) // Skip documents based on the current page
        .limit(limit);

      return res.status(OK).send({ data: data });
    } catch (err) {
      console.log(err);
      return res.status(SERVER_ERROR).send({ error: true, message: err });
    }
  },
};
