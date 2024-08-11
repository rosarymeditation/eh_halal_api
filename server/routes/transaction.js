const controller = require("../controllers/transaction");
const { rootUrl } = require("../utility/constants");
const { auth, upload } = require("../utility/global");
module.exports = (app) => {
  app.post(
    rootUrl("transaction-create"),
    auth,

    controller.create
  );
  app.post(
    rootUrl("transaction-create-web"),

    controller.createForWeb
  );
  app.post(
    rootUrl("transaction-mobile-latest"),
    auth,

    controller.createForMobileLatest
  );
  app.post(rootUrl("user-last-transaction"), auth, controller.userLastTotal);
  app.post(rootUrl("transaction-sum"), auth, controller.sumTotal);
  app.post(rootUrl("all-transactions"), controller.allTotal);
  //app.post(rootUrl("getLongAndLat"), controller.getLongAndLat);
  app.post(rootUrl("get-sessionToken"), controller.getSessionToken);
  app.post(rootUrl("user-transactions"), auth, controller.userTotal);
  app.post(
    rootUrl("user-transactions-forWeb"),

    controller.userTotalForWeb
  );
  app.post(rootUrl("updateStatus"), controller.updateStatus);
  app.post(rootUrl("dashboardSummary"), controller.dashboardSummary);
  app.post(rootUrl("getTotalByMonth"), controller.getTotalByMonth);
  ///getTotalByMonth
  app.post(rootUrl("get-user-reward"), auth, controller.getUserReward);
  app.post(
    rootUrl("user-transactions-by-id"),
    auth,
    controller.userTransactionsById
  );
  app.post(
    rootUrl("user-transactions-by-id-forWeb"),
    controller.userTransactionsByIdForWeb
  );
  app.post(rootUrl("stripe-payment"), controller.stripePayment);
};
