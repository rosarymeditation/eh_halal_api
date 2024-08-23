const controller = require("../controllers/coupon");
const { rootUrl } = require("../utility/constants");
const { auth, upload } = require("../utility/global");
module.exports = (app) => {
  app.post(rootUrl("coupon/create"), controller.create);
  app.post(rootUrl("coupon/list"), controller.findAll);
  app.post(rootUrl("coupon/byId"), controller.find);
  app.post(rootUrl("coupon/update"), controller.update);
  app.post(rootUrl("coupon/redeem"), controller.redeem);

  // app.post(rootUrl("address/byUser"), controller.findAllByUser);
  // app.post(rootUrl("address/toggle"), controller.toggleDefault);
  // app.post(rootUrl("address/update"), controller.updateAddress);
  // app.delete(rootUrl("address/:id"), controller.delete);
  // app.post(rootUrl("deleteForMobile"), controller.deleteForMobile);
  // app.patch(rootUrl("address/:id"), auth, controller.update);
};
