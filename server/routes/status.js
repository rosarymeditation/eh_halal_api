const controller = require("../controllers/status");
const { rootUrl } = require("../utility/constants");
const { auth, upload } = require("../utility/global");
module.exports = (app) => {
  app.post(
    rootUrl("status/create"),

    controller.create
  );
  app.post(rootUrl("status/all"), controller.findAll);
  app.delete(rootUrl("status/:id"), controller.delete);
  app.patch(
    rootUrl("status/:id"),

    controller.update
  );
};
