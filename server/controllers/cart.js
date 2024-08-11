// const PostCode = require("../models").PostCode;
// const Query = new require("../queries/crud");
// const validate = require("../validations/validation");
const sgMail = require("@sendgrid/mail");
const Cart = require("../models/cart");
const { upload } = require("../utility/global");

const {
  SERVER_ERROR,
  OK,
  VALIDATION_ERROR,
  Messages,
} = require("../errors/statusCode");
// const query = new Query(PostCode);

module.exports = {
  create: async (req, res) => {
    try {
      const photoObject = req.file;
      const photo = photoObject ? req.file.location : null;

      const { amount, userId, productId } = req.body;

      //
      const data = Cart({
        amount: amount,
        user: userId,
        product: productId,
      });
      await data.save();

      return res.status(OK).send({ error: false });
    } catch (err) {
      return res.status(OK).send({ error: true });
    }
  },
  findById: async (req, res) => {
    const id = req.body.id;

    try {
      const data = await Cart.findById(id);
      return res.status(OK).send(data);
    } catch (err) {
      return res.status(OK).send({ error: true, message: err });
    }
  },
  findAll: async (req, res) => {
    try {
      const data = await Cart.find();

      return res.status(OK).send({ data: data });
    } catch (err) {
      return res.status(SERVER_ERROR).send({ error: true, message: err });
    }
  },

  delete: async (req, res) => {
    try {
      const id = req.params.id;
      const data = await Cart.findByIdAndDelete(id);
      return res.status(OK).send({ error: false });
    } catch (err) {
      return res.status(OK).send({ error: true, message: err });
    }
  },

  update: async (req, res) => {
    try {
      const id = req.params.id;

      const { amount, userId, productId } = req.body;
      const updatedData = {
        amount: amount,
        user: userId,
        product: productId,
      };

      const options = { new: true };

      const result = await Cart.findByIdAndUpdate(id, updatedData, options);

      return res.status(OK).send({ error: false, result });
    } catch (err) {
      return res.status(OK).send({ error: true, message: err });
    }
  },
};
