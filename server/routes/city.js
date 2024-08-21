const controller = require("../controllers/city");
const { rootUrl } = require("../utility/constants");
module.exports = (app) => {
  app.post(
    rootUrl("city/create"),

    controller.create
  );

  app.post(
    rootUrl("city/all"),

    controller.findAll
  );
};
