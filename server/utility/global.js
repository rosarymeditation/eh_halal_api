const aws = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");
const jwt = require("jsonwebtoken");
const { FAILED_AUTH, OK } = require("../errors/statusCode");
const { ACCESS_TOKEN } = require("../utility/constants");
const openDesc = "Restaurants";
const closeDesc = "Food Sellers Currently Closed";
var path = require("path");
aws.config.update({
  secretAccessKey: process.env.S3SECRETKEY,
  accessKeyId: process.env.S3ACCESSKEY,
  region: "eu-west-2",
});
const s3 = new aws.S3();
function randomAlpabet() {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  const rand1 = alphabet[Math.floor(Math.random() * alphabet.length)];

  const rand2 = alphabet[Math.floor(Math.random() * alphabet.length)];
  const randNum = Math.floor(1000000 + Math.random() * 9000000);

  return `${rand1}${rand2}${randNum}`;
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function getConvertedDate() {
  let options = {
    timeZone: "Europe/London",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  };
  const formatter = new Intl.DateTimeFormat([], options);
  return formatter.format(new Date());
}
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/webp"
  ) {
    cb(null, true);
  } else {
    cb(
      new Error("Invalid Mime Type, only JPEG and PNG" + file.mimetype),
      false
    );
  }
};
const docFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/webp" ||
    file.mimetype === "application/pdf" ||
    file.mimetype === "doc" ||
    file.mimetype === "docx"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Invalid Mime Type"), false);
  }
};

// const upload = multer({
//   fileFilter,
//   storage: multerS3({
//     s3,
//     bucket: "foodengo2",
//     acl: "public-read",
//     metadata: function (req, file, cb) {
//       cb(null, { fieldName: "foodengo_img" });
//     },
//     key: function (req, file, cb) {
//       cb(null, `${Date.now()}${path.extname(file.originalname)}`);
//     },
//   }),
// });
const CapitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};
const upload = multer({
  storage: multerS3({
    s3,
    bucket: "foodmart",
    acl: "public-read",
    key: function (req, file, cb) {
      cb(
        null,
        `${file.originalname}-${Date.now()}${path.extname(file.originalname)}`
      );
    },
  }),
});
const uploadForCloudinary = multer({
  storage: multer.diskStorage({}),
  fileFilter: (req, file, cb) => {
    let ext = path.extname(file.originalname);
    if (ext !== ".mp4" && ext !== ".mkv") {
      cb(new Error("File type is not supported"), false);
      return;
    }
    cb(null, true);
  },
});

const uploadDoc = multer({
  docFilter,
  storage: multerS3({
    s3,
    bucket: "foodengo-license",
    contentType: multerS3.AUTO_CONTENT_TYPE,
    acl: "public-read",
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(null, `${Date.now()}${path.extname(file.originalname)}`);
    },
  }),
});

const pointDispatcher = (amount) => {
  //for every one pound is for 2 pounds
  const onePoint = 2;
  const point = Math.floor(amount / onePoint);

  return point;
};
let formatSlug = (str) => str.replace(/ /g, "_");
const authenticateUser = (req, res, next) => {
  try {
    const bearerHeader = req.headers.authorization;

    const bearer = bearerHeader.split(" ");
    const token = bearer[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.SECRET);
      req.userData = decoded;
      next();
    } else
      res.status(FAILED_AUTH).json({
        data: null,
        error: true,
      });
  } catch (err) {
    return res.status(FAILED_AUTH).json({
      data: null,
      error: true,
    });
  }
};
const duration = [
  { time: "5 mins", value: 5 },
  { time: "10 mins", value: 10 },
  { time: "15 mins", value: 15 },
  { time: "20 mins", value: 20 },
  { time: "25 mins", value: 25 },
  { time: "30 mins", value: 30 },
  { time: "35 mins", value: 35 },
  { time: "40 mins", value: 40 },
  { time: "45 mins", value: 45 },
  { time: "50 mins", value: 50 },
  { time: "55 mins", value: 55 },
  { time: "60 mins", value: 60 },
  { time: "80 mins", value: 80 },
  { time: "120 mins", value: 85 },
];
const randomSixDigits = () => {
  return Math.floor(100000 + Math.random() * 900000);
};
const daysOfWeek = () => {
  return [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
};
const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const ORDER_STATUS = [
  {
    id: 1,
    name: "Preparing",
  },
  {
    id: 1,
    name: "Ready",
  },
  {
    id: 2,
    name: "Delivered",
  },
  {
    id: 3,
    name: "Canceled",
  },
];
module.exports = {
  upload: upload,
  uploadForCloudinary,
  uploadDoc: uploadDoc,
  ORDER_STATUS,
  auth: authenticateUser,
  duration: duration,
  days: daysOfWeek,
  randomSixDigits,
  months,
  openDesc,
  closeDesc,
  randomAlpabet,
  getConvertedDate,
  rand,
  CapitalizeFirstLetter,
  pointDispatcher,
  formatSlug,
};
