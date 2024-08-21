// const PostCode = require("../models").PostCode;
// const Query = new require("../queries/crud");
// const validate = require("../validations/validation");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const Category = require("../models/category");
const Product = require("../models/product");
const { upload } = require("../utility/global");

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
      const photoObject = req.file;
      const photo = photoObject ? req.file.location : null;

      const { name } = req.body;

      //
      const data = Category({
        name: name,
        image: photo,
      });
      await data.save();

      return res.status(OK).send({ error: false });
    } catch (err) {
      console.log(err);
      return res.status(SERVER_ERROR).send({ error: true });
    }
  },

  createWithNoImage: async (req, res) => {
    try {
      const { name, url } = req.body;

      //
      const data = Category({
        name: name,
        image: url,
      });
      await data.save();

      return res.status(OK).send({ error: false });
    } catch (err) {
      console.log(err);
      return res.status(SERVER_ERROR).send({ error: true });
    }
  },
  findById: async (req, res) => {
    const id = req.body.id;

    try {
      const data = await Category.findById(id);
      return res.status(OK).send(data);
    } catch (err) {
      return res.status(OK).send({ error: true, message: err });
    }
  },
  findSeafoodCategory: async (req, res) => {
    const id = req.body.id;

    try {
      const categoryId = "6557b9a245ed61f61355ebc4";
      const seaFood = await Product.find({
        category: categoryId,
      })
        .populate("weightType")
        .limit(5);
      return res.status(OK).send({ data: seaFood, categoryId });
    } catch (err) {
      return res.status(OK).send({ error: true, message: err });
    }
  },
  findCondimentCategory: async (req, res) => {
    const id = req.body.id;

    try {
      const categoryId = "6557ba1b45ed61f61355ebc6";
      const condiment = await Product.find({
        category: categoryId,
      })
        .populate("weightType")
        .limit(5);
      return res.status(OK).send({ data: condiment, categoryId });
    } catch (err) {
      return res.status(OK).send({ error: true, message: err });
    }
  },
  findDrinkCategory: async (req, res) => {
    const id = req.body.id;

    try {
      const categoryId = "6557ba8345ed61f61355ebc8";
      const drink = await Product.find({
        category: categoryId,
      })
        .populate("weightType")
        .limit(5);
      return res.status(OK).send({ data: drink, categoryId: categoryId });
    } catch (err) {
      return res.status(OK).send({ error: true, message: err });
    }
  },
  findVegCategory: async (req, res) => {
    const id = req.body.id;

    try {
      const categoryId = "6557ba9d45ed61f61355ebca";
      const veg = await Product.find({
        category: categoryId,
      })
        .populate("weightType")
        .limit(5);
      return res.status(OK).send({ data: veg, categoryId });
    } catch (err) {
      return res.status(OK).send({ error: true, message: err });
    }
  },
  findGrainCategory: async (req, res) => {
    const id = req.body.id;

    try {
      const categoryId = "6557bac645ed61f61355ebcc";
      const grain = await Product.find({
        category: categoryId,
      })
        .populate("weightType")
        .limit(5);
      return res.status(OK).send({ data: grain, categoryId: categoryId });
    } catch (err) {
      return res.status(OK).send({ error: true, message: err });
    }
  },
  findMeatCategory: async (req, res) => {
    const id = req.body.id;

    try {
      const categoryId = "6557badd45ed61f61355ebce";
      const meat = await Product.find({
        category: categoryId,
      })
        .populate("weightType")
        .limit(5);
      return res.status(OK).send({ data: meat, categoryId });
    } catch (err) {
      return res.status(OK).send({ error: true, message: err });
    }
  },

  findCosmeticCategory: async (req, res) => {
    try {
      const categoryId = "6557cfb8777aa9cf7f055fd3";
      const cosmetic = await Product.find({
        category: categoryId,
      })
        .populate("weightType")
        .limit(5);
      return res.status(OK).send({ data: cosmetic, categoryId });
    } catch (err) {
      return res.status(OK).send({ error: true, message: err });
    }
  },
  //6557cfb8777aa9cf7f055fd3
  findAll: async (req, res) => {
    try {
      const data = await Category.find({ canShow: true });

      return res.status(OK).send({ data: data });
    } catch (err) {
      return res.status(SERVER_ERROR).send({ error: true, message: err });
    }
  },
  findAllForUser: async (req, res) => {
    try {
      const categoryIdsWithProducts = await Product.distinct("category");

      // Find categories with those IDs and where canShow is true
      const categoriesWithProducts = await Category.find({
        _id: { $in: categoryIdsWithProducts },
        canShow: true,
      });

      return res.status(OK).send({ data: categoriesWithProducts });
    } catch (err) {
      return res.status(SERVER_ERROR).send({ error: true, message: err });
    }
  },

  delete: async (req, res) => {
    try {
      const id = req.params.id;
      const data = await Category.findByIdAndDelete(id);
      return res.status(OK).send({ error: false });
    } catch (err) {
      return res.status(OK).send({ error: true, message: err });
    }
  },
  updatePost: async (req, res) => {
    try {
      const { name, url, _id, canShow } = req.body;
      const updatedData = {
        name,
        image: url,
        canShow,
      };

      const options = { new: true };

      const result = await Category.findByIdAndUpdate(
        _id,
        updatedData,
        options
      );

      return res.status(OK).send({ error: false, result });
    } catch (err) {
      return res.status(SERVER_ERROR).send({ error: true, message: err });
    }
  },
  update: async (req, res) => {
    try {
      const id = req.params.id;
      const photoObject = req.file;
      const photo = photoObject ? req.file.location : null;
      const { name } = req.body;
      const updatedData = {
        name,
        image: photo,
      };

      const options = { new: true };

      const result = await Category.findByIdAndUpdate(id, updatedData, options);

      return res.status(OK).send({ error: false, result });
    } catch (err) {
      return res.status(OK).send({ error: true, message: err });
    }
  },
};
