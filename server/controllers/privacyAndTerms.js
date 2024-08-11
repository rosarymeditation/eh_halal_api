// const PostCode = require("../models").PostCode;
// const Query = new require("../queries/crud");
// const validate = require("../validations/validation");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const PrivacyAndTerms = require("../models/privacyAndTerms");

const {
  SERVER_ERROR,
  OK,
  VALIDATION_ERROR,
  Messages,
} = require("../errors/statusCode");
// const query = new Query(PostCode);

module.exports = {
  createPrivacy: async (req, res) => {
    try {
      const { privacy, terms } = req.body;

      //
      const data = PrivacyAndTerms({
        privacy,
        terms,
      });
      await data.save();

      return res.status(OK).send({ error: false });
    } catch (err) {
      console.log(err);
      return res.status(SERVER_ERROR).send({ error: true });
    }
  },

  findAll: async (req, res) => {
    try {
      const data = await PrivacyAndTerms.find();

      return res.status(OK).send(data[0]);
    } catch (err) {
      return res.status(SERVER_ERROR).send({ error: true, message: err });
    }
  },
};
