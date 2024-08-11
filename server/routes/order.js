const controller = require("../controllers/order");
const { rootUrl } = require("../utility/constants");
const { auth, upload } = require("../utility/global");
module.exports = (app) => {
  app.post(
    rootUrl("order/create"),

    controller.create
  );
  app.post(rootUrl("order/all"), controller.findAll);
  app.post(rootUrl("order/findById"), controller.findById);
  app.delete(rootUrl("order/:id"), controller.delete);
  app.patch(rootUrl("order/:id"), auth, controller.update);
};
