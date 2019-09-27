const User = require("../models/User");
const { promisify } = require("es6-promisify");

exports.getLogin = (req, res) => {
  res.render("signin");
};
exports.getSignUp = (req, res) => {
  res.render("signup", {
    oldInputs: {
      username: "",
      email: ""
    }
  });
};

exports.validateRegistration = (req, res, next) => {
  req.checkBody("username", "Please Enter User Name").notEmpty();
  req.sanitizeBody("username");

  req.sanitizeBody("email").normalizeEmail({
    remove_dots: false,
    gmail_remove_subaddress: false
  });
  req.checkBody("email", "The Email is not Valid").isEmail();
  req.checkBody("password", `Password can't be blank`).notEmpty();
  req.checkBody("confirm-password", `Password can't be blank`).notEmpty();

  req
    .checkBody("confirm-password", `passwords doesn't match`)
    .equals(req.body.password);

  const errors = req.validationErrors();
  if (errors) {
    req.flash("error", errors.map(err => err.msg));
    res.render("signup", {
      errors: errors,
      body: req.body,
      flashes: req.flash(),
      oldInputs: {
        username: req.body.username,
        email: req.body.email
      }
    });
    return;
  }
  next();
};

exports.create = async (req, res, next) => {
  const { email, username, password } = req.body;
  const user = new User({ email: req.body.email, username: username });

  //** Listen to record  15- b - register  *//
  //** Listen to record  15- c - register  *//

  // User.register(user, password, function(err, user) => {

  // })

  // listen to record 11, 12, 13
  const register = promisify(User.register.bind(User));
  await register(user, password);
  next(); //pass to authController login
};

exports.getAccount = (req, res) => {
  res.render("account", {
    title: "My Account"
  });
};
