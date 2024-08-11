const controller = require("../controllers/favorite");
const { rootUrl } = require("../utility/constants");
const { auth, upload } = require("../utility/global");
module.exports = (app) => {
  app.post(rootUrl("toggle-favorite"), auth, controller.create);
  app.post(rootUrl("get-favorite-status"), auth, controller.checkIfFavorite);
  app.post(rootUrl("user-favorites"), auth, controller.favoritesByUser);
};
