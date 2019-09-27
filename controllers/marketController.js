const Market = require("../models/Market");
const multer = require("multer");
const jimp = require("jimp");
const uuid = require("uuid");
const path = require("path");
const multerOptions = {
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  }
};

checkFileType = (file, cb) => {
  // Allowed Extensions
  const filetypes = /jpeg|jpg|png|gif/;
  // Check extenstions
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check Mime
  const mimetype = filetypes.test(file.mimetype);
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb({ message: `the file type isn't allowed` }, false);
  }
};

//Upload Photo
exports.upload = multer(multerOptions).single("photo");

//Resize Photo
exports.resize = async (req, res, next) => {
  if (!req.file) {
    next(); //skip to the next middleware
    return;
  }

  const extname = req.file.mimetype.split("/")[1];
  req.body.photo = `${uuid.v4()}.${extname}`;
  // now we resize
  const photo = await jimp.read(req.file.buffer);
  await photo.resize(800, jimp.AUTO);
  await photo.write(`./public/uploads/${req.body.photo}`);

  next();
};

exports.getAdd = (req, res, next) => {
  res.render("new-market", {
    title: "Add New Market"
  });
};

exports.postNewMarket = async (req, res, next) => {
  req.body.author = req.user._id;
  const item = new Market(req.body);
  await item.save();
  res.redirect("/users/browse");
  req.flash("success", `Congratss`);
};

const confirmOwner = (marketItem, user) => {
  if (!marketItem.author.equals(user._id)) {
    req.flash("error", `You Must Own This Item To Edit`);
    throw Error("You Must Own a Store to Edit It !!");
  }
};

exports.getFeathuredMarketItems = async (req, res, next) => {
  const items = await Market.find().populate("author");

  if (!items) return next();
  res.render("account", {
    items: items,
    head: "Featured Items"
  });
};

exports.getMarketItems = async (req, res, next) => {
  const items = await Market.find({ author: req.user._id }).populate("author");

  if (!items) return next();
  res.render("browse", {
    items: items,
    title: " Browsing Market",
    head: "My Items"
  });
};

exports.editMarketItem = async (req, res, next) => {
  const { id } = req.params;
  const item = await Market.findOne({ _id: id });

  confirmOwner(item, req.user);

  res.render("editMarket", {
    title: "Edit Market",
    item: item
  });
};

exports.updateMarketItem = async (req, res, next) => {
  const { id } = req.params;
  const market = await Market.findOneAndUpdate({ _id: id }, req.body, {
    new: true,
    runValidators: true
  }).exec();
  res.redirect(`/users/browse`);
};
