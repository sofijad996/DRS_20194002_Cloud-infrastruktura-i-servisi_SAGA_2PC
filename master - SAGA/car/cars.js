const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();
app.use(bodyParser.json());

require("./Car");
const Car = mongoose.model("Car");

//Connect
mongoose.connect(
  "mongodb+srv://sofija:sofija@cloudmongocluster.ngsgx.azure.mongodb.net/?retryWrites=true&w=majority",
  () => {
    console.log("Database is connected!");
  }
);

app.post("/cars", (req, res) => {
  let newCar = req.body;

  //Create a new car
  let car = new Car(newCar);
  car
    .save()
    .then(() => {
      res.send("A new car created with success");
    })
    .catch((err) => {
      throw err;
    });
});

app.get("/cars", (req, res) => {
  Car.find()
    .then((cars) => {
      res.json(cars);
    })
    .catch((err) => {
      if (err) throw err;
    });
});

app.get("/cars/:id", (req, res) => {
  Car.findById(req.params.id).then((car) => {
    if (car) {
      res.json(car);
    } else {
      res.sendStatus(404);
    }
  });
});

app.delete("/cars/:id", (req, res) => {
  Car.findOneAndRemove(req.params.id)
    .then(() => {
      res.send("Car removed with success!");
    })
    .catch((err) => {
      if (err) throw err;
    });
});

app.listen(4545, () => {
  console.log("Up and running! -- This is our Cars service");
});