const controller = require("../controllers/suggestion");
const { rootUrl } = require("../utility/constants");
const { auth, upload } = require("../utility/global");
module.exports = (app) => {
  app.post(rootUrl("feedback"), controller.create);
};
