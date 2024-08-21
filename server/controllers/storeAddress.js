const Address = require("../models/storeAddress");
const { upload } = require("../utility/global");
const axios = require("axios");

const {
  SERVER_ERROR,
  OK,
  VALIDATION_ERROR,
  Messages,
} = require("../errors/statusCode");
// const query = new Query(PostCode);
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
