var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const expressValidator = require("express-validator");
var logger = require("morgan");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const flash = require("connect-flash");
const passport = require("passport");
const mongoose = require("mongoose");
// import environmental variables from our variables.env file
require("dotenv").config({ path: "variables.env" });

const MongoURI =
  "mongodb://mo7medsalah7:zad1520zad@ds153947.mlab.com:53947/uno-market";

const store = new MongoDBStore({
  uri: MongoURI,
  collection: "sessions"
});

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");

require("./handlers/passport");
var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(expressValidator());
app.use(cookieParser());

app.use(
  session({
    secret: "secret",
    key: process.env.KEY,
    resave: false,
    saveUninitialized: false,
    store: store
  })
);
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

// pass variables to our templates + all requests
app.use((req, res, next) => {
  res.locals.session = req.session;
  res.locals.user = req.user || null;
  res.locals.flashes = req.flash();
  res.locals.currentPath = req.path;
  next();
});

app.use("/", indexRouter);
app.use("/users", usersRouter);

mongoose
  .connect(MongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log("Mongo Is Connected"))
  .catch(err => console.log(err));
mongoose.Promise = global.Promise; // Tell Mongoose to use ES6 promises
mongoose.connection.on("error", err => {
  console.error(`🙅 🚫 🙅 🚫 🙅 🚫 🙅 🚫 → ${err.message}`);
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

const PORT = 7000 || process.env.port;

app.listen(PORT);
module.exports = app;
