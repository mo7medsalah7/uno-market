var express = require("express");
var router = express.Router();
const indexController = require("../controllers/indexController");
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");
const marketController = require("../controllers/marketController");

const { check, body } = require("express-validator/check");

const User = require("../models/User");
/* GET users listing. */
router.get("/logout", authController.isLoggedIn, authController.logout);

router.get("/login", authController.notLoggedIn, userController.getLogin);
router.post("/login", authController.login);
router.get(
  "/signup",
  authController.notLoggedIn,

  check("email").custom((value, { req }) => {
    return User.findOne({ email: value }).then(userDocument => {
      if (userDocument) {
        return Promise.reject("E-Mail exists already !!");
      }
    });
  }),
  userController.getSignUp
);
router.post(
  "/signup",
  userController.validateRegistration,
  userController.create,
  userController.getLogin
);

router.get(
  "/account",
  authController.isLoggedIn,
  marketController.getFeathuredMarketItems
);

router.get("/add", authController.isLoggedIn, marketController.getAdd);
router.post(
  "/add",
  marketController.upload,
  marketController.resize,
  marketController.postNewMarket
);
router.get(
  "/browse",
  authController.isLoggedIn,
  marketController.getMarketItems
);

router.get("/add/:id", marketController.editMarketItem);
router.post(
  "/add/:id",
  marketController.upload,
  marketController.resize,
  marketController.updateMarketItem
);

router.get("/forget", authController.getForgetPage);
router.post("/forget", authController.forget);

router.get("/account/reset/:token", authController.reset);
router.post(
  "/account/reset/:token",
  authController.confirmPassword,
  authController.updatePassword
);

module.exports = router;
