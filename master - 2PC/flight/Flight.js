const mongoose = require("mongoose");

mongoose.model("Flight+", {
  departingCity: {
    type: String,
    require: true,
  },
  destinationCity: {
    type: String,
    require: true,
  },
  flightNumber: {
    type: String,
    require: true,
  },
  price: {
    type: Number,
    require: true,
  },
  prepared: {
    type: Boolean,
    require: true,
    default: false,
  },
});
