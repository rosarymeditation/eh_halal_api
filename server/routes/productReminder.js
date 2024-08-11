const controller = require("../controllers/productReminder");
const { rootUrl } = require("../utility/constants");
const { auth, upload } = require("../utility/global");
module.exports = (app) => {
  app.post(rootUrl("product-reminder"), auth, controller.reminder);
  app.post(rootUrl("guest-product-reminder"), controller.guestReminder);

  app.post(rootUrl("productReminderList"), controller.findAll);
};
