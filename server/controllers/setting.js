// const PostCode = require("../models").PostCode;
// const Query = new require("../queries/crud");
// const validate = require("../validations/validation");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const Setting = require("../models/setting");
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
      //      deliveryStandard: { type: Number, default: 3 },
      // deliveryPremium: { type: Number, default: 4 },
      // mileRadius: { type: Number, default: 5 },
      // isShowSalePercent: { type: Boolean, default: false },
      // pricePerItem: { type: Number, default: 0 },t = req.file;
      // minOrder: { type: String, default: 10 },
      // freeDeliveryAmount: { type: String, default: 0 },
      // lastDeliveryHour: { type: String, default: 18 },
      const {
        deliveryStandard,
        mileRadius,
        minOrder,
        freeDeliveryAmount,
        lastDeliveryHour,
      } = req.body;
      console.log(req.body);
      let data;
      const getSettings = await Setting.find();
      if (getSettings.length == 0) {
        data = Setting({
          deliveryStandard,
          mileRadius,
          minOrder,
          freeDeliveryAmount,
          lastDeliveryHour,
        });
        await data.save();
      } else {
        const options = { new: true };
        const updatedData = {
          deliveryStandard,
          mileRadius,
          minOrder,
          freeDeliveryAmount,
          lastDeliveryHour,
        };
        const result = await Setting.findByIdAndUpdate(
          getSettings[0]._id,
          updatedData,
          options
        );
      }

      return res.status(OK).send({ error: false });
    } catch (err) {
      console.log(err);
      return res.status(SERVER_ERROR).send({ error: true });
    }
  },

  //6557cfb8777aa9cf7f055fd3
  findAll: async (req, res) => {
    try {
      const data = await Setting.find();
      if (data.length == 0) {
        return res.status(SERVER_ERROR).send({});
      }
      return res.status(OK).send(data[0]);
    } catch (err) {
      return res.status(SERVER_ERROR).send({ error: true, message: err });
    }
  },
};
