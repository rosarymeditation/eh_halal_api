const controller = require("../controllers/privacyAndTerms");
const { rootUrl } = require("../utility/constants");
const { auth, upload } = require("../utility/global");
module.exports = (app) => {
  app.post(rootUrl("createPrivacyAndTerms"), controller.createPrivacy);
  app.post(rootUrl("getPrivacyAndTerms"), controller.findAll);
};
