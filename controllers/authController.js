const passport = require("passport");
const User = require("../models/User");
const crypto = require("crypto");
const { promisify } = require("es6-promisify");

const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");

const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key:
        "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"
    }
  })
);

exports.login = passport.authenticate("local", {
  failureRedirect: "/users/login",
  failureFlash: "Failed Login. Try Again",
  successRedirect: "/users/account",
  successFlash: "You are now logged in"
});

exports.logout = (req, res, next) => {
  req.logout();
  req.flash("success", "Yopu are now logged out !!");
  res.render("signin", {
    isLoggedIn: req.isAuthenticated()
  });
};

exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
    return;
  }
  req.flash("error", `You Must Login`);
  res.redirect("/users/login");
};

exports.notLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    next();
    return;
  }
  req.flash("error", `You Must Login`);
  res.redirect("/");
};

exports.getForgetPage = (req, res) => {
  res.render("forget", {
    title: "Forgot Password"
  });
};

exports.forget = async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email });
  if (!user) {
    req.flash("error", `There's no such user.`);
    res.render("forget", {
      flashes: req.flash()
    });
  }
  user.resetPasswordToken = crypto.randomBytes(22).toString("hex");
  user.resetPasswordExpires = Date.now() + 3600000;

  const resetUrl = `http://${req.headers.host}/users/account/reset/${user.resetPasswordToken}`;

  await user.save();
  transporter.sendMail({
    to: user.email,
    from: "admin@uno-market.com",
    subject: "Reset Email",
    html: `    <html>
    <head>
      <title></title>
    </head>
    <body>
      <h1>Reset Email !</h1>
      <p>To Reset Your password Please Click Below</p>
      <a href="${resetUrl}">RESET</a>
    </body>
    </html>
  `
  });
  req.flash("success", `Email is Sent to your mail box`);
  res.render("index", {
    resetUrl: resetUrl,
    flashes: req.flash()
  });
};

exports.reset = (req, res, next) => {
  const user = User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() }
  });
  if (!user) {
    req.flash("error", "Password Reset in Invalid or has Expired");
    return res.redirect("/users/login");
  }
  res.render("reset", {
    title: "Reset My password"
  });
};

exports.confirmPassword = (req, res, next) => {
  if (req.body.password === req.body["confirm-password"]) {
    next();
    return;
  }
  req.flash("error", `Passwords don't match`);
  res.redirect("/");
};

exports.updatePassword = async (req, res) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user) {
    req.flash("error", "Password Reset in Invalid or has Expired");
    return res.redirect("/users/login");
  }

  const setPassword = promisify(user.setPassword.bind(user));
  await setPassword(req.body.password);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  const updatedUser = await user.save();
  await req.login(updatedUser).then(res.redirect("/"));
};
