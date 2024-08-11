const controller = require("../controllers/location");
const { rootUrl } = require("../utility/constants");
module.exports = (app) => {
  app.post(rootUrl("locationParams"), controller.getLocationParams);
};
