require("dotenv").config();
const cloudinary = require("cloudinary").v2;

// FIX: cloud_name, api_key, and api_secret were all hardcoded in
// plaintext. The api_secret in particular is the same value already
// found exposed in foodengo_server earlier today, confirming this
// credential has been reused across multiple repos. Moved all three
// to environment variables.
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = cloudinary;
