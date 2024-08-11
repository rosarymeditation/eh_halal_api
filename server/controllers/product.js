// const PostCode = require("../models").PostCode;
// const Query = new require("../queries/crud");
// const validate = require("../validations/validation");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const Product = require("../models/product");
const Category = require("../models/category");
const WeightType = require("../models/weighType");
const Image = require("../models/image");
const { upload, rand, formatSlug } = require("../utility/global");
const mongoose = require("mongoose");
const aws = require("aws-sdk");

aws.config.update({
  secretAccessKey: process.env.S3SECRETKEY,
  accessKeyId: process.env.S3ACCESSKEY,
  region: "eu-west-2",
});
const s3 = new aws.S3();
const {
  SERVER_ERROR,
  OK,
  VALIDATION_ERROR,
  Messages,
} = require("../errors/statusCode");
const category = require("./category");
// const query = new Query(PostCode);

module.exports = {
  create: async (req, res) => {
    try {
      const files = req.files;
      const imageIds = [];

      if (files.length == 0) {
        return res.status(SERVER_ERROR).send({ error: true });
      }

      const photoObject = req.file;
      const photo = photoObject ? req.file.location : null;

      const {
        name,
        price,
        quantity,
        description,
        categoryId,
        weight,
        weightTypeId,
        salePrice,
        percentageDiscount,
      } = req.body;

      files.forEach((file) => {
        console.log(file.location);
        const image = Image({ url: file.location });
        image.save();
        imageIds.push(image._id);
      });
      const data = Product({
        name: name,
        serial: rand(1, 100000) + rand(1, 100000),
        price: price,
        slug: formatSlug(name),
        quantity: quantity,
        description: description,
        category: categoryId,
        weight: weight,
        weightType: weightTypeId,
        images: imageIds,
        percentageDiscount: percentageDiscount,
        salePrice,
      });
      await data.save();

      return res.status(OK).send({ error: false });
    } catch (err) {
      console.log(err);
      return res.status(SERVER_ERROR).send({ error: true });
    }
  },
  createNew: async (req, res) => {
    try {
      const files = req.files;
      const imageIds = [];

      if (files.length == 0) {
        return res.status(SERVER_ERROR).send({ error: true });
      }

      const photoObject = req.file;
      const photo = photoObject ? req.file.location : null;

      const {
        name,
        price,
        description,
        categoryId,
        percentageDiscount,
        variations,
      } = req.body;
      //console.log(variations);
      const parsedVariations = JSON.parse(variations);
      // parsedVariations.forEach((item) => {
      //   console.log(item);
      // });

      files.forEach((file) => {
        console.log(file.location);
        const image = Image({ url: file.location });
        image.save();
        imageIds.push(image._id);
      });
      const data = Product({
        name: name,
        serial: rand(1, 100000) + rand(1, 100000),
        price: price,
        slug: formatSlug(name),
        description: description,
        category: categoryId,
        images: imageIds,
        variations: parsedVariations,
        percentageDiscount: percentageDiscount,
      });
      await data.save();

      return res.status(OK).send({ error: false });
    } catch (err) {
      console.log(err);
      return res.status(SERVER_ERROR).send({ error: true });
    }
  },

  findAllNew: async (req, res) => {
    try {
      const { page = 1, limit = 30, search = "" } = req.body;
      const partialSearchCriteria = {
        name: { $regex: new RegExp(search, "i") },
        canShow: true,
      };

      const data = search
        ? await Product.find(partialSearchCriteria)
            .skip((page - 1) * limit) // Skip documents based on the current page
            .limit(limit)
            .populate("weightType")
            .populate("images")
            .populate("category")
        : await Product.find({ canShow: true })
            .skip((page - 1) * limit) // Skip documents based on the current page
            .limit(limit)
            .populate("category")
            .populate("images")
            .populate("weightType");
      // .populate("status")
      // .populate("likes")
      // .populate("comments");
      const filterData = await Promise.all(
        data.map(async (item) => {
          // Map through each variation and handle async operations
          const variations = await Promise.all(
            item.variations.map(async (variation) => {
              const finalPrice = item.getFinalPriceForVariation(
                variation.price
              );
              const weightType = await WeightType.findById(
                variation.weightType
              );
              return {
                finalPrice,
                weightTypeId: variation.weightType._id,
                serial: variation.serial,
                weightType: weightType || null,
                quantity: variation.quantity,
                price: parseFloat(variation.price),
              };
            })
          );

          return {
            _id: item._id,
            name: item.name,
            price: item.price,
            slug: item.slug,
            serial: item.serial,
            category: item.category,
            isAvailable: item.isAvailable,
            images: item.images,
            percentageDiscount: item.percentageDiscount,
            description: item.description,
            isPopular: item.isPopular,
            canShow: item.canShow,
            variations: variations.length > 0 ? variations : null, // Include the processed variations
          };
        })
      );
      return res
        .status(OK)
        .send({ data: filterData, count: filterData.length });
    } catch (err) {
      console.log(err);
      return res.status(SERVER_ERROR).send({ error: true, message: err });
    }
  },

  searchName: async (req, res) => {
    try {
      const { page = 1, limit = 4, search = "" } = req.body;
      const partialSearchCriteria = {
        name: { $regex: new RegExp(search, "i") },
        canShow: true,
      };

      const data = search
        ? await Product.find(partialSearchCriteria)
            .skip((page - 1) * limit) // Skip documents based on the current page
            .limit(limit)
            .populate("weightType")
            .populate("images")
            .populate("category")
        : [];

      const filterData = await Promise.all(
        data.map(async (item) => {
          return {
            _id: item._id,
            name: item.name,
            price: item.price,
            slug: item.slug,
            serial: item.serial,
            category: item.category,
            isAvailable: item.isAvailable,
            images: item.images,
            percentageDiscount: item.percentageDiscount,
            description: item.description,
            isPopular: item.isPopular,
            canShow: item.canShow,
          };
        })
      );
      return res
        .status(OK)
        .send({ data: filterData, count: filterData.length });
    } catch (err) {
      console.log(err);
      return res.status(SERVER_ERROR).send({ error: true, message: err });
    }
  },
  updateWithoutImage: async (req, res) => {
    try {
      const id = req.body.id;

      console.log(req.body.id);
      const {
        isAvailable,
        isPopular,
        canShow,
        name,
        price,
        description,
        categoryId,
        percentageDiscount,
        variations,
      } = req.body;
      console.log("variations---------------------------");
      console.log(id);

      console.log("variations---------------------------");

      const updatedData = {
        name,
        price: price,
        description,
        slug: formatSlug(name),
        percentageDiscount,
        category: categoryId,
        isAvailable,
        isPopular,
        canShow,
        variations: variations,
      };

      const options = { new: true };

      const result = await Product.findByIdAndUpdate(id, updatedData, options);

      return res.status(OK).send({ error: false, result });
    } catch (err) {
      console.log(err);
      return res.status(SERVER_ERROR).send({ error: true, message: err });
    }
  },
  findAndUpdate: async (req, res) => {
    try {
      const products = await Product.find();
      products.forEach(async (item) => {
        const updatedData = {
          slug: formatSlug(item.name),
        };
        const options = { new: true };

        const result = await Product.findByIdAndUpdate(
          item._id,
          updatedData,
          options
        );
      });

      return res.status(OK).send({ error: false });
    } catch (err) {
      console.log(err);
      return res.status(OK).send({ error: true, message: err });
    }
  },
  update: async (req, res) => {
    try {
      const id = req.body.id;
      const imageIds = [];
      const files = req.files;
      const product = await Product.findById(id);
      if (files.length > 0) {
        await Image.deleteMany({ _id: { $in: product.images } });
        files.forEach((file) => {
          const image = Image({ url: file.location });
          imageIds.push(image._id);
          image.save();
        });
      }

      const {
        isAvailable,
        isPopular,
        canShow,
        name,
        price,
        description,
        categoryId,
        percentageDiscount,
        variations,
      } = req.body;
      const updatedData = {
        name,
        price: price,
        description,
        percentageDiscount,
        category: categoryId,
        isAvailable,
        isPopular,
        canShow,
        variations: variations,
      };
      if (files.length > 0) {
        updatedData.images = imageIds;
      }

      const options = { new: true };

      const result = await Product.findByIdAndUpdate(id, updatedData, options);

      return res.status(OK).send({ error: false, result });
    } catch (err) {
      return res.status(OK).send({ error: true, message: err });
    }
  },
  findById: async (req, res) => {
    const id = req.body.id;
    console.log(id);
    try {
      // Fetch the product by ID and populate the related fields
      const item = await Product.findById(id)
        .populate("weightType")
        .populate("images")
        .populate("category");

      if (!item) {
        return res
          .status(404)
          .send({ error: true, message: "Product not found" });
      }

      // Map through each variation and handle async operations
      const variations = await Promise.all(
        item.variations.map(async (variation) => {
          const finalPrice = item.getFinalPriceForVariation(variation.price);
          const weightType = await WeightType.findById(variation.weightType);

          return {
            finalPrice,
            weightTypeId: variation.weightType._id,
            serial: variation.serial,
            weightType: weightType || null,
            quantity: variation.quantity,
            price: parseFloat(variation.price),
          };
        })
      );

      // Construct the filtered data object
      const filterData = {
        _id: item._id,
        name: item.name,
        price: item.price,
        category: item.category,
        images: item.images,
        slug: item.slug,
        serial: item.serial,
        isAvailable: item.isAvailable,
        percentageDiscount: item.percentageDiscount,
        description: item.description,
        isPopular: item.isPopular,
        canShow: item.canShow,
        variations: variations.length > 0 ? variations : null, // Include the processed variations
      };

      // Return the filtered data
      return res.status(200).send(filterData);
    } catch (err) {
      console.error(err);
      return res.status(500).send({ error: true, message: err.message });
    }
  },
  // findById: async (req, res) => {
  //   const id = req.body.id;
  //   console.log(id);
  //   try {
  //     const data = await Product.findById(id)
  //       .populate("weightType")
  //       .populate("images")
  //       .populate("category");

  //     const filterData = await Promise.all(
  //       data.map(async (item) => {
  //         // Map through each variation and handle async operations
  //         const variations = await Promise.all(
  //           item.variations.map(async (variation) => {
  //             const finalPrice = item.getFinalPriceForVariation(
  //               variation.price
  //             );
  //             const weightType = await WeightType.findById(
  //               variation.weightType
  //             );
  //             return {
  //               finalPrice,
  //               weightTypeId: variation.weightType._id,
  //               serial: variation.serial,
  //               weightType: weightType || null,
  //               quantity: variation.quantity,
  //               price: parseFloat() variation.price,
  //             };
  //           })
  //         );

  //         return {
  //           name: item.name,
  //           price: item.price,
  //           slug: item.slug,
  //           serial: item.serial,
  //           percentageDiscount: item.percentageDiscount,
  //           description: item.description,
  //           isPopular: item.isPopular,
  //           canShow: item.canShow,
  //           variations: variations.length > 0 ? variations : null, // Include the processed variations
  //         };
  //       })
  //     );
  //     return res.status(OK).send(data);
  //   } catch (err) {
  //     return res.status(OK).send({ error: true, message: err });
  //   }
  // },

  findBySlug: async (req, res) => {
    const { name } = req.body;

    try {
      const data = await Product.findOne({ slug: name })
        .populate("weightType")
        .populate("images")
        .populate("category");
      console.log(data);
      return res.status(OK).send({ data: data });
    } catch (err) {
      return res.status(OK).send({ error: true, message: err });
    }
  },

  sumProduct: async (req, res) => {
    try {
      const product = await Product.find({ canShow: true });

      return res.status(OK).send({ sum: product.length });
    } catch (err) {
      console.log(err);
      return res.status(SERVER_ERROR).send({ error: true });
    }
  },

  findAll: async (req, res) => {
    try {
      const { page = 1, limit = 30, search = "" } = req.body;
      const partialSearchCriteria = {
        name: { $regex: new RegExp(search, "i") },
        canShow: true,
      };

      const data = search
        ? await Product.find(partialSearchCriteria)
            .skip((page - 1) * limit) // Skip documents based on the current page
            .limit(limit)
            .populate("weightType")
            .populate("images")
            .populate("category")
        : await Product.find({ canShow: true })
            .skip((page - 1) * limit) // Skip documents based on the current page
            .limit(limit)
            .populate("category")
            .populate("images")
            .populate("weightType");
      // .populate("status")
      // .populate("likes")
      // .populate("comments");
      return res.status(OK).send({ data: data, count: data.length });
    } catch (err) {
      console.log(err);
      return res.status(SERVER_ERROR).send({ error: true, message: err });
    }
  },

  findAllDelisted: async (req, res) => {
    try {
      const { page = 1, limit = 30, search = "" } = req.body;
      const partialSearchCriteria = {
        name: { $regex: new RegExp(search, "i") },
        canShow: false,
      };

      const data = search
        ? await Product.find(partialSearchCriteria)
            .skip((page - 1) * limit) // Skip documents based on the current page
            .limit(limit)
            .populate("weightType")
            .populate("images")
            .populate("category")
        : await Product.find({ canShow: false })
            .skip((page - 1) * limit) // Skip documents based on the current page
            .limit(limit)
            .populate("category")
            .populate("images")
            .populate("weightType");
      // .populate("status")
      // .populate("likes")
      // .populate("comments");
      return res.status(OK).send({ data: data, count: data.length });
    } catch (err) {
      console.log(err);
      return res.status(SERVER_ERROR).send({ error: true, message: err });
    }
  },
  findAllForWeb: async (req, res) => {
    try {
      const { page = 1, limit = 30, search = "" } = req.body;
      const partialSearchCriteria = {
        name: { $regex: new RegExp(search, "i") },
      };

      const data = search
        ? await Product.find(partialSearchCriteria)
            .skip((page - 1) * limit) // Skip documents based on the current page
            .limit(limit)
            .populate("weightType")
            .populate("images")
            .populate("category")
        : await Product.find()
            .skip((page - 1) * limit) // Skip documents based on the current page
            .limit(limit)
            .populate("category")
            .populate("images")
            .populate("weightType");

      const filter = data.map((item) => {
        return {
          id: item._id,
          name: item.name,
          price: item.price,
          salePrice: item.salePrice,
          serial: item.serial,
          stock: item.stock,
          percentageDiscount: item.percentageDiscount,
          weight: item.weight,
          description: item.description,
          isPopular: item.isPopular,
          isLocal: item.isLocal,
          canShow: item.canShow,
          images: item.images,
          isAvailable: item.isAvailable,
          category: item.category,
          images: item.images,
          weightType: item.weightType,
          slug: item.slug,
        };
      });

      return res.status(OK).send({ data: filter, count: data.length });
    } catch (err) {
      console.log(err);
      return res.status(SERVER_ERROR).send({ error: true, message: err });
    }
  },
  search: async (req, res) => {
    try {
      let hasData = false;
      const {
        page = 1,
        limit = 10,
        categoryId = "",
        search = "",
        isPopular = false,
        isFeatured = false,
      } = req.body;

      const partialSearchCriteria = {
        name: { $regex: new RegExp(search || "", "i") },
      };
      const categoryIdSearchCriteria = { canShow: true };
      if (search) {
        hasData = true;
      }
      if (categoryId) {
        hasData = true;
        categoryIdSearchCriteria.category = categoryId;
      }
      if (isFeatured) {
        hasData = true;
        categoryIdSearchCriteria.salePrice = {
          $gt: 0,
        };
      }
      if (isPopular) {
        hasData = true;
        categoryIdSearchCriteria.isPopular = true;
      }

      const combinedSearchCriteria = {
        $and: [partialSearchCriteria, categoryIdSearchCriteria],
      };

      const data = hasData
        ? await Product.find(combinedSearchCriteria)
            .skip((page - 1) * limit) // Skip documents based on the current page
            .limit(limit)
            .populate("category")
            .populate("images")
            .populate("weightType")
        : await Product.find({ canShow: true })
            .skip((page - 1) * limit) // Skip documents based on the current page
            .limit(limit)
            .populate("category")
            .populate("images")
            .populate("weightType");
      const filterData = await Promise.all(
        data.map(async (item) => {
          // Map through each variation and handle async operations
          const variations = await Promise.all(
            item.variations.map(async (variation) => {
              const finalPrice = item.getFinalPriceForVariation(
                variation.price
              );
              const weightType = await WeightType.findById(
                variation.weightType
              );
              return {
                finalPrice,
                weightTypeId: variation.weightType._id,
                serial: variation.serial,
                weightType: weightType || null,
                quantity: variation.quantity,
                price: parseFloat(variation.price),
              };
            })
          );

          return {
            _id: item._id,
            name: item.name,
            price: item.price,
            slug: item.slug,
            category: item.category,
            images: item.images,
            serial: item.serial,
            isAvailable: item.isAvailable,
            percentageDiscount: item.percentageDiscount,
            description: item.description,
            isPopular: item.isPopular,
            canShow: item.canShow,
            variations: variations.length > 0 ? variations : null, // Include the processed variations
          };
        })
      );
      return res.status(OK).send({ data: filterData });
    } catch (err) {
      console.log(err);
      return res.status(SERVER_ERROR).send({ error: true, message: err });
    }
  },
  searchForWeb: async (req, res) => {
    try {
      let hasData = false;
      const {
        page = 1,
        limit = 10,
        categoryName = "",
        search = "",
        isPopular = false,
        isFeatured = false,
      } = req.body;
      const findCategory = await Category.findOne({ name: categoryName });

      const partialSearchCriteria = {
        name: { $regex: new RegExp(search || "", "i") },
      };
      const categoryIdSearchCriteria = { canShow: true };
      if (search) {
        hasData = true;
      }
      if (findCategory) {
        hasData = true;
        categoryIdSearchCriteria.category = findCategory._id;
      }
      if (isFeatured) {
        hasData = true;
        categoryIdSearchCriteria.salePrice = {
          $gt: 0,
        };
      }
      if (isPopular) {
        hasData = true;
        categoryIdSearchCriteria.isPopular = true;
      }

      const combinedSearchCriteria = {
        $and: [partialSearchCriteria, categoryIdSearchCriteria],
      };

      const data = hasData
        ? await Product.find(combinedSearchCriteria)
            .skip((page - 1) * limit) // Skip documents based on the current page
            .limit(limit)
            .populate("category")
            .populate("images")
            .populate("weightType")
        : await Product.find({ canShow: true })
            .skip((page - 1) * limit) // Skip documents based on the current page
            .limit(limit)
            .populate("category")
            .populate("images")
            .populate("weightType");

      const totalRecNum = hasData
        ? await Product.find(combinedSearchCriteria)
            .skip((page - 1) * limit) // Skip documents based on the current page
            .limit(limit + 1)
        : await Product.find({ canShow: true })
            .skip((page - 1) * limit) // Skip documents based on the current page
            .limit(limit + 1);

      const filter = data.map((item) => {
        return {
          id: item._id,
          name: item.name,
          price: item.price,

          stock: item.stock,
          salePrice: item.salePrice,
          serial: item.serial,
          percentageDiscount: item.percentageDiscount,
          weight: item.weight,
          description: item.description,
          isPopular: item.isPopular,
          isLocal: item.isLocal,
          canShow: item.canShow,
          images: item.images,
          isAvailable: item.isAvailable,
          category: item.category,
          images: item.images,
          slug: item.slug,
          weightType: item.weightType,
        };
      });

      return res.status(OK).send({
        data: filter,
        hasCategory: findCategory ? true : false,
        totalNum: totalRecNum.length,
      });
    } catch (err) {
      console.log(err);
      return res.status(SERVER_ERROR).send({ error: true, message: err });
    }
  },

  findAllByCategoryName: async (req, res) => {
    try {
      const { page = 1, limit = 20, categoryName, search = "" } = req.body;
      const category = await Category.findOne({ name: categoryName });
      const partialSearchCriteria = {
        name: { $regex: new RegExp(search, "i") },
      };
      const categoryIdSearchCriteria = {
        category: category._id,
        canShow: true,
      };
      const combinedSearchCriteria = {
        $and: [partialSearchCriteria, categoryIdSearchCriteria],
      };

      const data = search
        ? await Product.find(combinedSearchCriteria)
            .skip((page - 1) * limit) // Skip documents based on the current page
            .limit(limit)
            .populate("category")
            .populate("images")
            .populate("weightType")
        : await Product.find({ category: category._id, canShow: true })
            .skip((page - 1) * limit) // Skip documents based on the current page
            .limit(limit)
            .populate("category")
            .populate("images")
            .populate("weightType");
      const filterData = await Promise.all(
        data.map(async (item) => {
          // Map through each variation and handle async operations
          const variations = await Promise.all(
            item.variations.map(async (variation) => {
              const finalPrice = item.getFinalPriceForVariation(
                variation.price
              );
              const weightType = await WeightType.findById(
                variation.weightType
              );
              return {
                finalPrice,
                weightTypeId: variation.weightType._id,
                serial: variation.serial,
                weightType: weightType || null,
                quantity: variation.quantity,
                price: parseFloat(variation.price),
              };
            })
          );

          return {
            _id: item._id,
            name: item.name,
            price: item.price,
            slug: item.slug,
            serial: item.serial,
            isAvailable: item.isAvailable,
            category: item.category,
            images: item.images,
            percentageDiscount: item.percentageDiscount,
            description: item.description,
            isPopular: item.isPopular,
            canShow: item.canShow,
            variations: variations.length > 0 ? variations : null, // Include the processed variations
          };
        })
      );
      return res.status(OK).send({ data: filterData });
    } catch (err) {
      console.log(err);
      return res.status(SERVER_ERROR).send({ error: true, message: err });
    }
  },
  findAllByCategory: async (req, res) => {
    try {
      const { page = 1, limit = 20, categoryId, search = "" } = req.body;
      const partialSearchCriteria = {
        name: { $regex: new RegExp(search, "i") },
      };
      const categoryIdSearchCriteria = { category: categoryId, canShow: true };
      const combinedSearchCriteria = {
        $and: [partialSearchCriteria, categoryIdSearchCriteria],
      };

      const data = search
        ? await Product.find(combinedSearchCriteria)
            .skip((page - 1) * limit) // Skip documents based on the current page
            .limit(limit)
            .populate("category")
            .populate("images")
            .populate("weightType")
        : await Product.find({ category: categoryId, canShow: true })
            .skip((page - 1) * limit) // Skip documents based on the current page
            .limit(limit)
            .populate("category")
            .populate("images")
            .populate("weightType");
      const filterData = await Promise.all(
        data.map(async (item) => {
          // Map through each variation and handle async operations
          const variations = await Promise.all(
            item.variations.map(async (variation) => {
              const finalPrice = item.getFinalPriceForVariation(
                variation.price
              );
              const weightType = await WeightType.findById(
                variation.weightType
              );
              return {
                finalPrice,
                weightTypeId: variation.weightType._id,
                serial: variation.serial,
                weightType: weightType || null,
                quantity: variation.quantity,
                price: parseFloat(variation.price),
              };
            })
          );

          return {
            _id: item._id,
            name: item.name,
            price: item.price,
            slug: item.slug,
            serial: item.serial,
            isAvailable: item.isAvailable,
            percentageDiscount: item.percentageDiscount,
            description: item.description,
            category: item.category,
            images: item.images,
            isPopular: item.isPopular,
            canShow: item.canShow,
            variations: variations.length > 0 ? variations : null, // Include the processed variations
          };
        })
      );

      return res.status(OK).send({ data: filterData });
    } catch (err) {
      console.log(err);
      return res.status(SERVER_ERROR).send({ error: true, message: err });
    }
  },

  findPopular: async (req, res) => {
    try {
      const { page = 1, limit = 20 } = req.body;

      const data = await Product.find({
        isPopular: true,
        canShow: true,
        isAvailable: true,
      })
        .skip((page - 1) * limit) // Skip documents based on the current page
        .limit(limit)
        .populate("category")
        .populate("images")
        .populate("weightType")
        .sort({ name: "desc" });

      const filterData = await Promise.all(
        data.map(async (item) => {
          // Map through each variation and handle async operations
          const variations = await Promise.all(
            item.variations.map(async (variation) => {
              const finalPrice = item.getFinalPriceForVariation(
                variation.price
              );
              const weightType = await WeightType.findById(
                variation.weightType
              );
              return {
                finalPrice,
                weightTypeId: variation.weightType._id,
                serial: variation.serial,
                weightType: weightType || null,
                quantity: variation.quantity,
                price: parseFloat(variation.price),
              };
            })
          );

          return {
            _id: item._id,
            name: item.name,
            price: item.price,
            slug: item.slug,
            category: item.category,
            images: item.images,
            serial: item.serial,
            isAvailable: item.isAvailable,
            percentageDiscount: item.percentageDiscount,
            description: item.description,
            isPopular: item.isPopular,
            canShow: item.canShow,
            variations: variations.length > 0 ? variations : null, // Include the processed variations
          };
        })
      );
      return res.status(OK).send({ data: filterData });
    } catch (err) {
      console.log(err);
      return res.status(SERVER_ERROR).send({ error: true, message: err });
    }
  },

  findPopularForWeb: async (req, res) => {
    try {
      const { page = 1, limit = 10 } = req.body;

      const data = await Product.find({
        isPopular: true,
        canShow: true,
        isAvailable: true,
      })
        .skip((page - 1) * limit) // Skip documents based on the current page
        .limit(limit)
        .populate("category")
        .populate("images")
        .populate("weightType");

      const filterData = await Promise.all(
        data.map(async (item) => {
          // Map through each variation and handle async operations
          const variations = await Promise.all(
            item.variations.map(async (variation) => {
              const finalPrice = item.getFinalPriceForVariation(
                variation.price
              );
              const weightType = await WeightType.findById(
                variation.weightType
              );
              return {
                finalPrice,
                weightTypeId: variation.weightType._id,
                serial: variation.serial,
                weightType: weightType || null,
                quantity: variation.quantity,
                price: parseFloat(variation.price),
              };
            })
          );

          return {
            _id: item._id,
            name: item.name,
            price: item.price,
            slug: item.slug,
            serial: item.serial,
            isAvailable: item.isAvailable,
            category: item.category,
            images: item.images,
            percentageDiscount: item.percentageDiscount,
            description: item.description,
            isPopular: item.isPopular,
            canShow: item.canShow,
            variations: variations.length > 0 ? variations : null, // Include the processed variations
          };
        })
      );
      return res.status(OK).send({ data: filterData });
    } catch (err) {
      console.log(err);
      return res.status(SERVER_ERROR).send({ error: true, message: err });
    }
  },

  findDiscounted: async (req, res) => {
    try {
      const { page = 1, limit = 10 } = req.body;

      const data = await Product.find({
        salePrice: { $gt: 0 },
        canShow: true,
        isAvailable: true,
      })
        .skip((page - 1) * limit) // Skip documents based on the current page
        .limit(limit)
        .populate("category")
        .populate("images")
        .populate("weightType");
      return res.status(OK).send({ data: data });
    } catch (err) {
      console.log(err);
      return res.status(SERVER_ERROR).send({ error: true, message: err });
    }
  },

  delete: async (req, res) => {
    try {
      const id = req.params.id;
      const data = await Product.findByIdAndDelete(id);
      return res.status(OK).send({ error: false });
    } catch (err) {
      return res.status(OK).send({ error: true, message: err });
    }
  },

  toggle: async (req, res) => {
    try {
      const id = req.body.productId;
      const findOne = await Product.findById(id);

      const options = { new: true };

      const result = await Product.findByIdAndUpdate(
        id,
        { isAvailable: !findOne.isAvailable },
        options
      );
      return res.status(OK).send({ error: false, result });
    } catch (err) {
      return res.status(OK).send({ error: true, message: err });
    }
  },
};
