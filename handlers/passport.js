const passport = require("passport");
const mongoose = require("mongoose");
const User = require("../models/User");
const LocalStrategy = require("passport-local").Strategy;

passport.use(User.createStrategy());

//Listen to record 17 - passport
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
