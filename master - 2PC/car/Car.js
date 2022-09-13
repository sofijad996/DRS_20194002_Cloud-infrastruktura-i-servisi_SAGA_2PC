const mongoose = require("mongoose");

mongoose.model("Car+", {
  manufacturer: {
    type: String,
    require: true,
  },
  model: {
    type: String,
    require: false,
  },
  registrationNumber: {
    type: String,
    require: true,
  },
  rentalPricePerDay: {
    type: Number,
    require: false,
  },
  prepared: {
    type: Boolean,
    require: true,
    default: false,
  },
});
