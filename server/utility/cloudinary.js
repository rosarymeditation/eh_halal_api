const cloudinary = require("cloudinary").v2;
cloudinary.config({
    cloud_name: "dwfqzydum",
    api_key: "818339153567867",
    api_secret:"REDACTED_CLOUDINARY_SECRET"
})
module.exports = cloudinary;