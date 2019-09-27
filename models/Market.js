const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const marketSchema = new mongoose.Schema({
  name: {
    type: String
  },
  description: {
    type: String,
    trim: true
  },
  photo: String,
  price: {
    type: Number
  },
  created: {
    type: Date,
    default: Date.now()
  },
  author: {
    type: mongoose.Schema.ObjectId,
    ref: "User"
  }
});
marketSchema.index({
  name: "text"
});
const Market = mongoose.model("Market", marketSchema);
module.exports = Market;
