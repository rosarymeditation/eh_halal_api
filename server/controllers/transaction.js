// const PostCode = require("../models").PostCode;
// const Query = new require("../queries/crud");
// const validate = require("../validations/validation");
const sgMail = require("@sendgrid/mail");
const axios = require("axios");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const Transaction = require("../models/transaction");
const Address = require("../models/address");
const Status = require("../models/status");
const Total = require("../models/total");
const twilio = require("twilio");
const Reward = require("../models/reward");
const { upload, rand, pointDispatcher } = require("../utility/global");
const mongoose = require("mongoose");
const { email1 } = require("../utility/constants");
const { SERVER_ERROR, OK } = require("../errors/statusCode");
const User = require("../models/user");
const SessionToken = require("../models/sessionToken");
const Product = require("../models/product");
const accountSid = process.env.TWILIOSID; // Your Account SID from www.twilio.com/console
const authToken = process.env.TWILIOTOKEN; // Your Auth Token from www.twilio.com/console
const client = new twilio(accountSid, authToken);
const stripe = require("stripe")(process.env.STRIPE);
const numbersToSend = ["+447857965032", "+447935885977"];
// const query = new Query(PostCode);
function roundUp(num) {
  var num = 10.12345;
  var precision = 2;
  var formattedNumber =
    Math.round(num * Math.pow(10, precision)) / Math.pow(10, precision);
  return formattedNumber;
}
const getMonthRange = (year, month) => {
  const startOfMonth = new Date(year, month, 1);
  const endOfMonth = new Date(year, month + 1, 1);
  return { startOfMonth, endOfMonth };
};
async function getLatLong(address) {
  try {
    const response = await axios.get(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        address
      )}.json`,
      {
        params: {
          access_token:
            "pk.eyJ1Ijoic21pdGhrb3giLCJhIjoiY2x3MjJtbTFmMGZjeTJqb2NxOGY5eG44aCJ9.Y2utmgzcBsViNtICgW04sQ",
        },
      }
    );

    if (response.data.features.length > 0) {
      const location = response.data.features[0].center;
      const latitude = location[1];
      const longitude = location[0];
      return { latitude, longitude };
    } else {
      throw new Error("No results found");
    }
  } catch (error) {
    console.error("Error fetching geolocation:", error.message);
    return null;
  }
}
module.exports = {
  create: async (req, res) => {
    try {
      const id = req.userData.id;
      const {
        subTotal,
        productArray,
        total,
        deliveryPrice,
        discount,
        address,
        lat,
        lng,
        deliveryDay,
        message,
      } = req.body;

      const refNum = rand(11111111, 99999999);
      const findUser = await User.findById(id);

      const currentDate = new Date();
      const day = currentDate.getDate();
      const month = currentDate.getMonth() + 1; // Months are zero-indexed, so
      const year = currentDate.getFullYear();
      //const getAddress = await Address.findOne({ userId: id, isDefault: true });
      const findStatus = await Status.findOne({ name: "Pending" });
      const totalData = Total({
        day: day,
        month: month,
        year: year,
        transactionId: refNum,
        subTotal: subTotal,
        status: findStatus._id,
        discount: discount,
        total: total,
        lng: lng,
        lat: lat,
        deliveryPrice: deliveryPrice,
        user: id,
        address: address,
        message: message,
        deliveryDay,
      });
      await totalData.save();
      const itemArr = [];
      productArray.forEach(async (item) => {
        const itemTotal = item.quantity * item.price;
        itemArr.push({
          quantity: item.quantity,
          name: item.name,
          price: `£${itemTotal.toFixed(2)}`,
        });
        const data = Transaction({
          totalId: totalData._id,
          name: item.name,
          product: item.id,
          price: item.price,
          quantity: item.quantity,
          user: id,
        });
        await data.save();
      });
      const msg = {
        to: findUser.email,
        from: email1,
        templateId: "d-add0ea161c8049629508b15ffddc688a",
        dynamic_template_data: {
          user: findUser.firstname || "user",
          items: itemArr,
          total: total,
          subTotal: subTotal,
          deliveryPrice: deliveryPrice,
          discount: discount,
          order_num: refNum,
        },
      };

      sgMail.send(msg, (error, result) => {
        if (error) {
          console.log(error);
        } else {
          console.log("That's wassup!");
        }
      });
      numbersToSend.forEach((number) => {
        client.messages
          .create({
            body: `${findUser.firstname}, ordered from AfroFoodMart and order total is £${total}`,
            from: "Afro Food", // Your Twilio phone number
            to: number,
          })
          .then((message) =>
            console.log(`Message sent to ${number}: ${message.sid}`)
          )
          .catch((error) =>
            console.error(
              `Error sending message to ${number}: ${error.message}`
            )
          );
      });
      return res.status(OK).send({ error: false });
    } catch (err) {
      console.log(err);
      return res.status(OK).send({ error: true });
    }
  },

  createForMobileLatest: async (req, res) => {
    try {
      const id = req.userData.id;
      const {
        subTotal,
        productArray,
        total,
        deliveryPrice,
        discount,
        deliveryDay,
        message,
        address,
        postCode,
        city,
      } = req.body;
      const currentDate = new Date();
      const day = currentDate.getDate();
      const month = currentDate.getMonth() + 1; // Months are zero-indexed, so
      const year = currentDate.getFullYear();
      const refNum = rand(11111111, 99999999);
      const findUser = await User.findById(id);
      // const getAddress = await Address.findOne({ user: id, isDefault: true });

      const coords = await getLatLong(`${address} ${postCode} ${city}`);
      const findStatus = await Status.findOne({ name: "Pending" });
      const totalData = Total({
        day: day,
        month: month,
        year: year,
        transactionId: refNum,
        subTotal: subTotal,
        status: findStatus._id,
        discount: discount,
        total: total,
        lng: coords?.longitude,
        lat: coords?.latitude,
        deliveryPrice: deliveryPrice,
        user: id,
        address: `${address}${postCode}${city}`,
        message: message,
        deliveryDay,
      });
      await totalData.save();
      const itemArr = [];
      productArray.forEach(async (item) => {
        const itemTotal = item.quantity * item.price;
        itemArr.push({
          quantity: item.quantity,
          name: item.name,
          price: `£${itemTotal.toFixed(2)}`,
        });
        const data = Transaction({
          totalId: totalData._id,
          name: item.name,
          product: item.id,
          price: item.price,
          quantity: item.quantity,
          user: id,
        });
        await data.save();
      });
      const msg = {
        to: findUser.email,
        from: email1,
        templateId: "d-add0ea161c8049629508b15ffddc688a",
        dynamic_template_data: {
          user: findUser.firstname || "user",
          items: itemArr,
          total: total,
          subTotal: subTotal,
          deliveryPrice: deliveryPrice,
          discount: 0,
          order_num: refNum,
        },
      };

      sgMail.send(msg, (error, result) => {
        if (error) {
          console.log(error);
        } else {
          console.log("That's wassup!");
        }
      });
      numbersToSend.forEach((number) => {
        client.messages
          .create({
            body: `${findUser.firstname}, ordered from AfroFoodMart and order total is £${total}`,
            from: "Afro Food", // Your Twilio phone number
            to: number,
          })
          .then((message) =>
            console.log(`Message sent to ${number}: ${message.sid}`)
          )
          .catch((error) =>
            console.error(
              `Error sending message to ${number}: ${error.message}`
            )
          );
      });
      return res.status(OK).send({ error: false });
    } catch (err) {
      console.log(err);
      return res.status(OK).send({ error: true });
    }
  },
  createForWeb: async (req, res) => {
    try {
      const id = req.body.id;
      const currentDate = new Date();
      const day = currentDate.getDate();
      const month = currentDate.getMonth() + 1; // Months are zero-indexed, so
      const year = currentDate.getFullYear();
      const {
        subTotal,
        productArray,
        total,
        deliveryPrice,
        discount,
        lat,
        lng,
        deliveryDay,
        message,
      } = req.body;
      const refNum = rand(11111111, 99999999);
      const findUser = await User.findById(id);
      const getAddress = await Address.findOne({ user: id, isDefault: true });
      console.log(getAddress);
      const address = getAddress?.address;
      const postCode = getAddress?.postCode;
      const coords = await getLatLong(`${address} ${postCode}`);
      const findStatus = await Status.findOne({ name: "Pending" });
      const totalData = Total({
        day: day,
        month: month,
        year: year,
        transactionId: refNum,
        subTotal: subTotal,
        status: findStatus._id,
        discount: discount,
        total: total,
        lng: coords?.longitude,
        lat: coords?.latitude,
        deliveryPrice: deliveryPrice,
        user: id,
        address: `${address}${postCode}`,
        message: message,
        deliveryDay,
      });
      await totalData.save();
      const itemArr = [];
      productArray.forEach(async (item) => {
        const itemTotal = item.quantity * item.price;
        itemArr.push({
          quantity: item.quantity,
          name: item.name,
          price: `£${itemTotal.toFixed(2)}`,
        });
        const data = Transaction({
          totalId: totalData._id,
          name: item.name,
          product: item.id,
          price: item.price,
          quantity: item.quantity,
          user: id,
        });
        await data.save();
      });
      const msg = {
        to: findUser.email,
        from: email1,
        templateId: "d-add0ea161c8049629508b15ffddc688a",
        dynamic_template_data: {
          user: findUser.firstname || "user",
          items: itemArr,
          total: total,
          subTotal: subTotal,
          deliveryPrice: deliveryPrice,
          discount: discount,
          order_num: refNum,
        },
      };

      sgMail.send(msg, (error, result) => {
        if (error) {
          console.log(error);
        } else {
          console.log("That's wassup!");
        }
      });
      numbersToSend.forEach((number) => {
        client.messages
          .create({
            body: `${findUser.firstname}, ordered from AfroFoodMart and order total is £${total}`,
            from: "Afro Food", // Your Twilio phone number
            to: number,
          })
          .then((message) =>
            console.log(`Message sent to ${number}: ${message.sid}`)
          )
          .catch((error) =>
            console.error(
              `Error sending message to ${number}: ${error.message}`
            )
          );
      });
      return res.status(OK).send({ error: false });
    } catch (err) {
      console.log(err);
      return res.status(OK).send({ error: true });
    }
  },
  getSessionToken: async (req, res) => {
    try {
      const sessionId = req.body.id;
      const data = await SessionToken.findOne({ session: sessionId });
      if (data) {
        await SessionToken.findByIdAndDelete(data._id);
      }
      return res.status(OK).send({ hasToken: data ? true : false });
    } catch (err) {
      console.log(err);
      return res.status(SERVER_ERROR).send({ error: true });
    }
  },

  getUserReward: async (req, res) => {
    try {
      const id = req.userData.id;
      let dataObject = {};
      const data = await Reward.findOne({ user: id });
      dataObject.points = data.points || 0;
      dataObject.max = 2000;

      return res.status(OK).send(dataObject);
    } catch (err) {
      console.log(err);
      return res.status(SERVER_ERROR).send({ error: true });
    }
  },
  userTotal: async (req, res) => {
    try {
      const { page = 1, limit = 10, search = "" } = req.body;
      const newArray = [];
      const id = req.userData.id;
      const totalData = await Total.find({ user: id })
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({
          createdAt: -1,
        });
      for (item of totalData) {
        const data = await Transaction.find({
          totalId: item._id,
        });
        const status = await Status.findById(item.status);
        newArray.push({
          status: status,
          total: item.total,
          subTotal: item.subTotal,
          deliveryPrice: item.deliveryPrice,
          discount: item.discount,
          address: item.address,
          deliveryDay: item.deliveryDay,
          lng: item.lng,
          lat: item.lat,
          transactions: data,
          createdAt: item.createdAt,
          transactionId: item.transactionId,
        });
      }

      return res.status(OK).send({ error: false, data: newArray });
    } catch (err) {
      console.log(err);
      return res.status(SERVER_ERROR).send({ error: true });
    }
  },

  userTotalForWeb: async (req, res) => {
    try {
      const { page = 1, limit = 10, search = "" } = req.body;
      const newArray = [];
      const id = req.body.id;
      const totalData = await Total.find({ user: id })
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({
          createdAt: -1,
        });
      for (item of totalData) {
        const data = await Transaction.find({
          totalId: item._id,
        });
        const status = await Status.findById(item.status);
        newArray.push({
          status: status,
          total: item.total,
          subTotal: item.subTotal,
          deliveryPrice: item.deliveryPrice,
          discount: item.discount,
          address: item.address,
          deliveryDay: item.deliveryDay,
          lng: item.lng,
          lat: item.lat,
          transactions: data,
          createdAt: item.createdAt,
          transactionId: item.transactionId,
        });
      }

      return res.status(OK).send({ error: false, data: newArray });
    } catch (err) {
      console.log(err);
      return res.status(SERVER_ERROR).send({ error: true });
    }
  },

  userLastTotal: async (req, res) => {
    try {
      const id = req.userData.id;
      const totalData = await Total.findOne({ user: id }).sort({
        createdAt: -1,
      });
      const data = await Transaction.find({
        totalId: totalData._id,
      });
      const status = await Status.findById(item.status);
      const newObj = {
        total: totalData.total,
        subTotal: totalData.subTotal,
        deliveryPrice: totalData.deliveryPrice,
        discount: totalData.discount,
        address: totalData.address,
        deliveryDay: item.deliveryDay,
        lng: item.lng,
        lat: item.lat,
        status: status,
        transactions: data,
        createdAt: totalData.createdAt,
        transactionId: totalData.transactionId,
      };

      return res.status(OK).send(newObj);
    } catch (err) {
      console.log(err);
      return res.status(SERVER_ERROR).send({ error: true });
    }
  },

  getTotalByMonth: async (req, res) => {
    try {
      const currentYear = new Date().getFullYear();

      // Generate an array of months (0-11)
      const months = Array.from({ length: 12 }, (_, i) => i);
      const data = [];
      // Map each month to its date range and perform aggregation
      for (const month of months) {
        const { startOfMonth, endOfMonth } = getMonthRange(currentYear, month);

        const result = await Total.aggregate([
          {
            $match: {
              createdAt: {
                $gte: startOfMonth,
                $lt: endOfMonth,
              },
            },
          },
          {
            $group: {
              _id: null,
              totalSales: { $sum: { $toDouble: "$total" } },
            },
          },
          {
            $project: {
              _id: 0,
              totalSales: 1,
            },
          },
        ]);
        data.push(
          result[0]?.totalSales
            ? parseFloat(result[0]?.totalSales)
            : parseFloat("1.22")
        );
        //const totalSales = result.length > 0 ? result[0].totalSales : 0;
        // console.log(`Total Sales for ${monthNames[month]}: ${totalSales}`);
      }

      return res.status(OK).send({ totals: data });
    } catch (err) {
      console.log(err);
      return res.status(SERVER_ERROR).send({ error: true });
    }
  },

  allTotal: async (req, res) => {
    try {
      const newArray = [];

      const { page = 1, limit = 10 } = req.body;
      const totalData = await Total.find()
        .populate("status")
        .skip((page - 1) * limit)
        .sort({
          createdAt: -1,
        });
      for (item of totalData) {
        const data = await Transaction.find({
          totalId: item._id,
        });
        const status = await Status.findById(item.status);
        newArray.push({
          _id: item._id,
          total: item.total,
          status: status,
          subTotal: item.subTotal,
          deliveryPrice: item.deliveryPrice,
          discount: item.discount,
          address: item.address,
          transactions: data,
          deliveryDay: item.deliveryDay,
          lng: item.lng,
          lat: item.lat,
          createdAt: item.createdAt,
          transactionId: item.transactionId,
        });
      }

      return res.status(OK).send({ error: false, data: newArray });
    } catch (err) {
      console.log(err);
      return res.status(SERVER_ERROR).send({ error: true });
    }
  },

  sumTotal: async (req, res) => {
    try {
      const total = await Total.find();

      return res.status(OK).send({ sum: total.length || 0 });
    } catch (err) {
      console.log(err);
      return res.status(SERVER_ERROR).send({ error: true });
    }
  },

  userTransactionsById: async (req, res) => {
    try {
      let { totalId } = req.body;
      const id = req.userData.id;

      const data = await Transaction.find({ totalId }).sort({
        createdAt: -1,
      });

      return res.status(OK).send({ error: false, data: data });
    } catch (err) {
      console.log(err);
      return res.status(SERVER_ERROR).send({ error: true });
    }
  },
  userTransactionsByIdForWeb: async (req, res) => {
    try {
      let { totalId } = req.body;

      const data = await Transaction.find({ totalId }).sort({
        createdAt: -1,
      });

      return res.status(OK).send({ error: false, data: data });
    } catch (err) {
      console.log(err);
      return res.status(SERVER_ERROR).send({ error: true });
    }
  },
  dashboardSummary: async (req, res) => {
    try {
      const orders = await Total.find();
      const users = await User.find({ role: "6561f6041db79909ad422ac5" });
      const products = await Product.find({ canShow: true });
      const total = await Total.aggregate([
        {
          $group: {
            _id: null,
            total: {
              $sum: { $toDouble: "$total" },
            },
          },
        },
        {
          $project: {
            _id: 0,
            total: 1,
          },
        },
      ]);
      console.log(total);
      const totalOrders = orders.length.toString() || "0.00";
      const totalUsers = users.length.toString() || "0.00";
      const totalProducts = products.length.toString() || "0.00";
      const sum = total.length > 0 ? total[0].total.toString() : "0.00";

      return res
        .status(OK)
        .send({ error: false, totalOrders, totalUsers, totalProducts, sum });
    } catch (err) {
      console.log(err);
      return res.status(OK).send({
        totalOrders: "0",
        totalUsers: "0",
        totalProducts: "0",
        sum: "0.00",
      });
    }
  },
  updateStatus: async (req, res) => {
    try {
      const { statusId, id } = req.body;
      console.log(req.body);
      const updatedData = {
        status: statusId,
      };

      const options = { new: true };

      const result = await Total.findByIdAndUpdate(id, updatedData, options);

      return res.status(OK).send({ error: false, result });
    } catch (err) {
      console.log(err);
      return res.status(SERVER_ERROR).send({ error: true, message: err });
    }
  },
  stripePayment: async (req, res) => {
    let { amount, isForWeb = false } = req.body;
    amount = parseInt(amount * 100);
    const lineItem = [
      {
        price_data: {
          currency: "gbp",
          product_data: {
            name: `Payment for Grocery`,
          },
          unit_amount: amount,
        },
        quantity: 1,
      },
    ];
    const randNum = rand(1000, 99999999999);
    data = {
      payment_method_types: ["card"],
      line_items: lineItem,
      mode: "payment",
      success_url: isForWeb
        ? `http://localhost:3000/payment-success/${randNum}`
        : "https://success/",
      cancel_url: isForWeb
        ? "http://localhost:3000/payment-error"
        : "https://error",
    };

    const session = await stripe.checkout.sessions.create(data);
    if (session?.id) {
      const data = SessionToken({
        session: randNum,
      });
      await data.save();
    }

    res.status(OK).send(session.id);
  },
};
