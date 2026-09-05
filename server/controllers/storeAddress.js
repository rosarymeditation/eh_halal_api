const Address = require("../models/storeAddress");
const { upload , getLatLong} = require("../utility/global");
const axios = require("axios");

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
      const { id, address, postCode, cityId } = req.body;
      const mergeAddress = `${address}, ${postCode}`;
      const lon = await getLatLong(mergeAddress);
      const latitude = lon.latitude;
      const longitude = lon.longitude;
      console.log(cityId);

      const findAddress = await Address.find();
      if (findAddress == 0) {
        const data = Address({
          address: address,
          postCode: postCode,
          latitude: latitude,
          longitude: longitude,
          city: cityId,
        });
        await data.save();
      } else {
        const updatedData = {
          address: address,
          postCode: postCode,
          latitude: latitude,
          longitude: longitude,
          city: cityId,
        };

        const options = { new: true };

        const result = await Address.findByIdAndUpdate(
          id,
          updatedData,
          options
        );
      }

      return res.status(OK).send(lon);
    } catch (err) {
      console.log(err);
      return res.status(SERVER_ERROR).send({ error: true });
    }
  },

  findAll: async (req, res) => {
    try {
      const data = await Address.find().populate("city");
      if (data.length == 0) {
        return res.status(SERVER_ERROR).send([]);
      }
      return res.status(OK).send(data[0]);
    } catch (err) {
      return res.status(SERVER_ERROR).send({ error: true, message: err });
    }
  },
};
