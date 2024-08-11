const controller = require("../controllers/product");
const { rootUrl } = require("../utility/constants");
const { auth, upload } = require("../utility/global");
module.exports = (app) => {
  app.post(
    rootUrl("product/create"),
    upload.array("image", 5),

    controller.create
  );

  app.post(
    rootUrl("product/create-new"),
    upload.array("image", 5),

    controller.createNew
  );
  app.post(rootUrl("toggle-product"), controller.toggle);
  app.post(rootUrl("product/search"), controller.search);
  app.post(rootUrl("product/search-for-web"), controller.searchForWeb);
  app.post(rootUrl("product/all"), controller.findAll);
  app.post(rootUrl("product/all-new"), controller.findAllNew);
  app.post(rootUrl("product/all-delisted"), controller.findAllDelisted);
  app.post(rootUrl("product/webAll"), controller.findAllForWeb);
  //findAllForWeb
  app.post(rootUrl("findAndUpdate"), controller.findAndUpdate);
  app.post(rootUrl("product/popular"), controller.findPopular);
  app.post(rootUrl("product/popularForWeb"), controller.findPopularForWeb);
  app.post(rootUrl("product/discounted"), controller.findDiscounted);
  app.post(rootUrl("product-sum"), controller.sumProduct);
  app.post(rootUrl("productsByCategory"), controller.findAllByCategory);
  app.post(rootUrl("findAllByCategoryName"), controller.findAllByCategoryName);
  app.post(rootUrl("product/findById"), controller.findById);
  app.post(rootUrl("product/findByName"), controller.findBySlug);
  app.post(rootUrl("searchName"), controller.searchName);
  app.delete(rootUrl("product/:id"), controller.delete);
  app.post(
    rootUrl("product/update"),
    upload.array("image", 5),

    controller.update
  );
  app.post(
    rootUrl("product/updateWithoutImage"),

    controller.updateWithoutImage
  );
};
