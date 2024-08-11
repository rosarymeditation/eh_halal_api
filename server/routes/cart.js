const controller = require("../controllers/cart");
const { rootUrl } = require("../utility/constants");
const { auth, upload } = require("../utility/global");
module.exports = (app) => {
  app.post(rootUrl("cart/create"), controller.create);
  app.post(rootUrl("cart/all"), controller.findAll);
  app.post(rootUrl("cart/findById"), controller.findById);
  app.delete(rootUrl("cart/:id"), controller.delete);
  app.patch(rootUrl("cart/:id"), controller.update);
};
