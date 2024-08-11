const controller = require("../controllers/category");
const { rootUrl } = require("../utility/constants");
const { auth, upload } = require("../utility/global");
module.exports = (app) => {
  app.post(
    rootUrl("category/create"),
    upload.single("image"),

    controller.create
  );
  app.post(
    rootUrl("category/create-with-no-image"),
    controller.createWithNoImage
  );
  app.post(rootUrl("category/all"), controller.findAll);
  app.post(rootUrl("findCondimentCategory"), controller.findCondimentCategory);
  app.post(rootUrl("findSeafoodCategory"), controller.findSeafoodCategory);
  app.post(rootUrl("findDrinkCategory"), controller.findDrinkCategory);
  app.post(rootUrl("findVegCategory"), controller.findVegCategory);
  app.post(rootUrl("findGrainCategory"), controller.findGrainCategory);
  app.post(rootUrl("findMeatCategory"), controller.findMeatCategory);
  app.post(rootUrl("findCosmeticCategory"), controller.findCosmeticCategory);
  app.post(rootUrl("category/findById"), controller.findById);
  app.delete(rootUrl("category/:id"), controller.delete);
  app.patch(
    rootUrl("category/:id"),
    upload.single("image"),

    controller.update
  );
  app.post(rootUrl("category/update"), controller.updatePost);

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

  //   app.get(rootUrl("category/display"), controller.display);

  //   app.get(rootUrl("category/:id"), controller.findPk);

  //   app.patch(rootUrl("category/:id"), controller.update);

  //   app.delete(rootUrl("category/:id"), controller.delete);
};
