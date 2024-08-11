// const PostCode = require("../models").PostCode;
// const Query = new require("../queries/crud");
// const validate = require("../validations/validation");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const { upload } = require("../utility/global");

const {
  SERVER_ERROR,
  OK,
  VALIDATION_ERROR,
  Messages,
} = require("../errors/statusCode");
const WeightType = require("../models/weighType");
// const query = new Query(PostCode);

module.exports = {
  create: async (req, res) => {
    try {
      const { name } = req.body;

      //
      const data = WeightType({
        name: name,
      });
      await data.save();

      return res.status(OK).send({ error: false });
    } catch (err) {
      console.log(err);
      return res.status(SERVER_ERROR).send({ error: true });
    }
  },
  findById: async (req, res) => {
    const id = req.body.id;

    try {
      const data = await WeightType.findById(id);
      return res.status(OK).send(data);
    } catch (err) {
      return res.status(OK).send({ error: true, message: err });
    }
  },
  findAll: async (req, res) => {
    try {
      const data = await WeightType.find({ canShow: true });

      return res.status(OK).send({ data: data });
    } catch (err) {
      return res.status(SERVER_ERROR).send({ error: true, message: err });
    }
  },

  delete: async (req, res) => {
    try {
      const id = req.params.id;
      const data = await WeightType.findByIdAndDelete(id);
      return res.status(OK).send({ error: false });
    } catch (err) {
      return res.status(OK).send({ error: true, message: err });
    }
  },
  updatePost: async (req, res) => {
    try {
      const { name, _id, canShow } = req.body;
      const updatedData = {
        name,
        canShow,
      };

      const options = { new: true };

      const result = await WeightType.findByIdAndUpdate(
        _id,
        updatedData,
        options
      );

      return res.status(OK).send({ error: false, result });
    } catch (err) {
      return res.status(SERVER_ERROR).send({ error: true, message: err });
    }
  },
  update: async (req, res) => {
    try {
      const id = req.params.id;

      const { name } = req.body;
      const updatedData = {
        name,
      };

      const options = { new: true };

      const result = await WeightType.findByIdAndUpdate(
        id,
        updatedData,
        options
      );

      return res.status(OK).send({ error: false, result });
    } catch (err) {
      return res.status(OK).send({ error: true, message: err });
    }
  },
};
