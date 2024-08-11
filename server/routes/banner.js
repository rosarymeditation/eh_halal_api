const controller = require("../controllers/banner");
const { rootUrl } = require("../utility/constants");
const { auth, upload } = require("../utility/global");
module.exports = (app) => {
  app.post(
    rootUrl("banner/create"),
    upload.single("banner"),
    controller.create
  );

  app.post(rootUrl("banner/all"), controller.findAll);
};
