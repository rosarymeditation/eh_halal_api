const controller = require("../controllers/weightType");
const { rootUrl } = require("../utility/constants");
const { upload } = require("../utility/global");
module.exports = (app) => {
  app.post(
    rootUrl("weighType/create"),

    controller.create
  );
  app.post(rootUrl("weighType/all"), controller.findAll);
  app.post(rootUrl("weighType/findById"), controller.findById);
  app.delete(rootUrl("weighType/:id"), controller.delete);
  app.post(rootUrl("weighType/update"), controller.updatePost);
  app.patch(
    rootUrl("weighType/:id"),

    controller.update
  );

  //   app.get(rootUrl("categories"), controller.findAll);

  //   app.post(rootUrl("categoriesByPopular"), controller.findByPopular);
  //   app.post(rootUrl("findCategorySearch"), controller.findCategorySearch);
  //   app.post(rootUrl("categoriesByShop"), controller.findByShop);
  //   app.post(rootUrl("findCategoryByShopUrl"), controller.findCategoryByShopUrl);
  //   //findCategoryByShopUrl
  //   app.post(
  //     rootUrl("allCategoriesForMobile"),
  //     controller.findAllCategoriesForMobile
  //   );

  //   app.get(rootUrl("categoriesLighter"), controller.findAllLighter);

  //   app.get(rootUrl("weighType/display"), controller.display);

  //   app.get(rootUrl("weighType/:id"), controller.findPk);

  //   app.patch(rootUrl("weighType/:id"), controller.update);

  //   app.delete(rootUrl("weighType/:id"), controller.delete);
};
