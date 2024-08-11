const Order = require("../models/order");
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
      const { amount, subTotal, userId, productId } = req.body;

      //
      const data = Order({
        amount: amount,
        subTotal: subTotal,
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
      const data = await Order.findById(id);
      return res.status(OK).send(data);
    } catch (err) {
      return res.status(OK).send({ error: true, message: err });
    }
  },
  findAll: async (req, res) => {
    try {
      const { page = 1, limit = 10 } = req.body;

      const data = await Order.find()
        .skip((page - 1) * limit) // Skip documents based on the current page
        .limit(limit);
      return res.status(OK).send(data);
    } catch (err) {
      return res.status(SERVER_ERROR).send({ error: true, message: err });
    }
  },

  delete: async (req, res) => {
    try {
      const id = req.params.id;
      const data = await Order.findByIdAndDelete(id);
      return res.status(OK).send({ error: false });
    } catch (err) {
      return res.status(OK).send({ error: true, message: err });
    }
  },

  update: async (req, res) => {
    try {
      console.log(req.params.id);
      const id = req.params.id;
      const photoObject = req.file;
      const photo = photoObject ? req.file.location : null;
      const { amount, subTotal, userId, productId } = req.body;
      const updatedData = {
        amount: amount,
        subTotal: subTotal,
        user: userId,
        product: productId,
      };

      const options = { new: true };

      const result = await Order.findByIdAndUpdate(id, updatedData, options);

      return res.status(OK).send({ error: false, result });
    } catch (err) {
      return res.status(OK).send({ error: true, message: err });
    }
  },
};
