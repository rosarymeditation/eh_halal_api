// const PostCode = require("../models").PostCode;
// const Query = new require("../queries/crud");
// const validate = require("../validations/validation");

const {
  SERVER_ERROR,
  OK,
  VALIDATION_ERROR,
  Messages,
} = require("../errors/statusCode");
const Suggestion = require("../models/suggestion");
// const query = new Query(PostCode);

module.exports = {
  create: async (req, res) => {
    try {
      const body = req.body;
      const data = Suggestion(body);
      await data.save();

      return res.status(OK).send({ error: false });
    } catch (err) {
      return res.status(OK).send({ error: true });
    }
  },
};
