// const PostCode = require("../models").PostCode;
// const Query = new require("../queries/crud");
// const validate = require("../validations/validation");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const Status = require("../models/status");
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
      const { name, color } = req.body;

      //
      const data = Status({
        name: name,
        color: color,
      });
      await data.save();

      return res.status(OK).send({ error: false });
    } catch (err) {
      console.log(err);
      return res.status(SERVER_ERROR).send({ error: true });
    }
  },

  //6557cfb8777aa9cf7f055fd3
  findAll: async (req, res) => {
    try {
      const data = await Status.find();

      return res.status(OK).send({ data: data });
    } catch (err) {
      return res.status(SERVER_ERROR).send({ error: true, message: err });
    }
  },

  delete: async (req, res) => {
    try {
      const id = req.params.id;
      const data = await Status.findByIdAndDelete(id);
      return res.status(OK).send({ error: false });
    } catch (err) {
      return res.status(OK).send({ error: true, message: err });
    }
  },

  update: async (req, res) => {
    try {
      const id = req.params.id;

      const { name, color } = req.body;
      const updatedData = {
        name,
        color,
      };

      const options = { new: true };

      const result = await Status.findByIdAndUpdate(id, updatedData, options);

      return res.status(OK).send({ error: false, result });
    } catch (err) {
      return res.status(OK).send({ error: true, message: err });
    }
  },
};
