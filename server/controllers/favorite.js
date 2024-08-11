// const PostCode = require("../models").PostCode;
// const Query = new require("../queries/crud");
// const validate = require("../validations/validation");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const Product = require("../models/product");
const Favorite = require("../models/favorite");
const { upload, rand } = require("../utility/global");
const mongoose = require("mongoose");
const {
  SERVER_ERROR,
  OK,
  VALIDATION_ERROR,
  Messages,
} = require("../errors/statusCode");
// const query = new Query(PostCode);

module.exports = {
  create: async (req, res) => {
    try {
      const id = req.userData.id;

      const { productId } = req.body;

      //
      const findFavorite = await Favorite.findOne({
        userId: id,
        productId: productId,
      });
      if (!findFavorite) {
        const data = Favorite({
          userId: id,
          productId: productId,
          product: productId,
        });
        await data.save();
      } else {
        const data = await Favorite.findByIdAndDelete(findFavorite._id);
      }

      return res.status(OK).send({ error: false });
    } catch (err) {
      console.log(err);
      return res.status(SERVER_ERROR).send({ error: true });
    }
  },
  checkIfFavorite: async (req, res) => {
    const id = req.userData.id;

    const { productId } = req.body;
    console.log(productId);
    try {
      const findFavorite = await Favorite.findOne({
        userId: id,
        productId: productId,
      });
      console.log(findFavorite);
      return res.status(OK).send({ isFavorite: findFavorite ? true : false });
    } catch (err) {
      console.log(err);
      return res.status(SERVER_ERROR).send({ error: true, message: err });
    }
  },

  favoritesByUser: async (req, res) => {
    try {
      const newArray = [];
      const id = req.userData.id;
      const favorites = await Favorite.find({ userId: id })
        .populate("product")

        .populate({
          path: "product", // Specify the path to populate for the second level
          populate: [
            {
              path: "category",
              // Specify the path to populate for the third level
            },
            { path: "images" },
          ],
        });

      for (var item of favorites) {
        var itemObj = item.product;

        itemObj.weightType = null;
        //itemObj.product.category = null;
        newArray.push(itemObj);
      }
      // const data = favorites.map((item) => {
      //   return { data: item.product };
      // });

      return res.status(OK).send({ data: newArray });
    } catch (err) {
      console.log(err);
      return res.status(SERVER_ERROR).send({ error: true });
    }
  },
};
