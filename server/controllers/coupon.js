const Coupon = require("../models/coupon");
const { upload } = require("../utility/global");

const {
  SERVER_ERROR,
  OK,
  VALIDATION_ERROR,
  Messages,
} = require("../errors/statusCode");
// const query = new Query(PostCode);
function hasDateExpired(expirationDate) {
  const currentDate = new Date(); // Get the current date and time
  const expiryDate = new Date(expirationDate); // Convert the expiration date to a Date object

  // Compare the dates
  return expiryDate < currentDate; // Returns true if the expiration date is in the past
}
module.exports = {
  create: async (req, res) => {
    try {
      const { code, discountType, discountValue, expirationDate, startDate } =
        req.body;
      const findCode = await Coupon.findOne({ code: code });

      if (!findCode) {
        const data = Coupon({
          code: code.toUpperCase(),
          discountType: discountType,
          discountValue: discountValue,
          expirationDate: expirationDate,
          startDate: startDate,
        });
        await data.save();
        return res
          .status(OK)
          .send({ error: false, message: "Coupon created successfully" });
      } else {
        return res
          .status(SERVER_ERROR)
          .send({ error: true, message: "Coupon already exist" });
      }
    } catch (err) {
      console.log(err);
      return res
        .status(SERVER_ERROR)
        .send({ error: true, message: "Coupon could not be created" });
    }
  },
  // findDefaultAddress: async (req, res) => {
  //   const id = req.userData.id;
  //   let data;
  //   try {
  //     data = await Coupon.findOne({ user: id, isDefault: true });
  //     if (data == null) {
  //       data = await Coupon.findOne({ user: id, isDefault: false });
  //     }
  //     return res.status(OK).send(data);
  //   } catch (err) {
  //     return res.status(SERVER_ERROR).send({ error: true, message: err });
  //   }
  // },
  // updateAddress: async (req, res) => {
  //   const { userId, id, address, postCode, city } = req.body;

  //   try {
  //     const updatedData = {
  //       address: address,
  //       postCode: postCode,
  //       city: city,
  //     };

  //     const options = { new: true };

  //     const result = await Coupon.findByIdAndUpdate(id, updatedData, options);

  //     return res.status(OK).send({ error: false });
  //   } catch (err) {
  //     return res.status(SERVER_ERROR).send({ error: true });
  //   }
  // },
  // toggleDefault: async (req, res) => {
  //   const userId = req.body.userId;
  //   const id = req.body.id;

  //   try {
  //     const data = await Coupon.find({ user: userId });

  //     for (var item of data) {
  //       const updatedData = {
  //         isDefault: false,
  //       };

  //       const options = { new: true };

  //       const result = await Coupon.findByIdAndUpdate(
  //         item.id,
  //         updatedData,
  //         options
  //       );
  //     }
  //     // Update individual address  below to True.
  //     const updatedData = {
  //       isDefault: true,
  //     };

  //     const options = { new: true };

  //     const result = await Coupon.findByIdAndUpdate(id, updatedData, options);

  //     return res.status(OK).send({ error: false });
  //   } catch (err) {
  //     return res.status(SERVER_ERROR).send({ error: true });
  //   }
  // },
  findAll: async (req, res) => {
    try {
      const data = await Coupon.find();
      const filterData = data.map((item) => {
        return {
          id: item._id,
          code: item.code,
          hasDateExpired: hasDateExpired(item.expirationDate),
          discountType: item.discountType,
          discountValue: item.discountValue.toString(),
          expirationDate: item.expirationDate,
          startDate: item.startDate,
        };
      });
      return res.status(OK).send({ data: filterData });
    } catch (err) {
      return res.status(SERVER_ERROR).send({ error: true, message: err });
    }
  },

  find: async (req, res) => {
    const { id } = req.body;
    try {
      const data = await Coupon.findById(id);

      return res.status(OK).send(data);
    } catch (err) {
      return res.status(SERVER_ERROR).send({ error: true, message: err });
    }
  },

  redeem: async (req, res) => {
    try {
      let { coupon, total } = req.body;

      if (total) {
        total = parseFloat(total);
      }
      const today = new Date();
      const data = await Coupon.findOne({
        expirationDate: { $gt: today },
        code: coupon,
      });
      if (!data) {
        return res.status(SERVER_ERROR).send({ error: true });
      } else {
        if (data.discountType === "Fixed") {
          const grantTotal = parseFloat(data.discountValue) - total;
          console.log(data.discountValue);
          return res
            .status(OK)
            .send({ grantTotal: grantTotal, discount: `£${discountValue}` });
        } else {
          const percentageValue = data.discountValue / 100;
          const grantTotal = total - percentageValue * total;
          return res
            .status(OK)
            .send({ grantTotal, discount: `%${discountValue}` });
        }
      }
    } catch (err) {
      console.log(err);
      return res.status(SERVER_ERROR).send({ error: true, message: err });
    }
  },

  // delete: async (req, res) => {
  //   try {
  //     const id = req.params.id;
  //     const data = await Coupon.findByIdAndDelete(id);
  //     return res.status(OK).send({ error: false });
  //   } catch (err) {
  //     return res.status(SERVER_ERROR).send({ error: true, message: err });
  //   }
  // },
  // deleteForMobile: async (req, res) => {
  //   try {
  //     const id = req.body.id;
  //     const data = await Coupon.findByIdAndDelete(id);
  //     return res.status(OK).send({ error: false });
  //   } catch (err) {
  //     return res.status(SERVER_ERROR).send({ error: true, message: err });
  //   }
  // },

  update: async (req, res) => {
    try {
      const {
        id,
        code,
        discountType,
        discountValue,
        expirationDate,
        startDate,
      } = req.body;

      const updatedData = {
        code: code.toUpperCase(),
        discountType: discountType,
        discountValue: discountValue,
        expirationDate: expirationDate,
        startDate: startDate,
      };

      const options = { new: true };

      const result = await Coupon.findByIdAndUpdate(id, updatedData, options);

      return res
        .status(OK)
        .send({ error: false, message: "Coupon updated successfully" });
    } catch (err) {
      console.log(err);
      return res.status(SERVER_ERROR).send({ error: true, message: err });
    }
  },
};
