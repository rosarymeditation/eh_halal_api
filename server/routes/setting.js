const controller = require("../controllers/setting");
const { rootUrl } = require("../utility/constants");
const { auth, upload } = require("../utility/global");
module.exports = (app) => {
  app.post(rootUrl("update-settings"), controller.create);
  app.post(rootUrl("find-settings"), controller.findAll);
};
