const controller = require("../controllers/storeAddress");
const { rootUrl } = require("../utility/constants");
module.exports = (app) => {
  app.post(rootUrl("storeAddress/create"), controller.create);
  app.post(rootUrl("storeAddress/find"), controller.findAll);
};
