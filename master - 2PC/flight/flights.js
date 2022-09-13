const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();
app.use(bodyParser.json());

require("./Flight");
const Flight = mongoose.model("Flight+");

//Connect
mongoose.connect(
  "mongodb+srv://sofija:sofija@cloudmongocluster.ngsgx.azure.mongodb.net/?retryWrites=true&w=majority",
  () => {
    console.log("Database is connected!");
  }
);

app.post("/flights", (req, res) => {
  let newFlight = req.body;

  //Create a new flight
  let flight = new Flight(newFlight);
  flight
    .save()
    .then(() => {
      res.send("A new flight created with success");
    })
    .catch((err) => {
      throw err;
    });
});

app.get("/flights", (req, res) => {
  Flight.find()
    .then((flights) => {
      res.json(flights);
    })
    .catch((err) => {
      if (err) throw err;
    });
});

app.get("/flights/:id", (req, res) => {
  Flight.findById(req.params.id).then((flight) => {
    if (flight) {
      res.json(flight);
    } else {
      res.sendStatus(404);
    }
  });
});

app.put("/flights/:id", async (req, res) => {
  try {
    const flight = await Flight.findById(req.params.id);
    req.query.prepared = req.query.prepared === "true";
    if (flight.prepared !== req.query.prepared) {
      Object.assign(flight, req.query);
      flight.save();
      res.send(true);
    } else {
      res.send(false);
    }
  } catch (error) {
    res.status(404).send(false);
  }
});

app.delete("/flights/:id", (req, res) => {
  Flight.findOneAndRemove(req.params.id)
    .then(() => {
      res.send("Flight removed with success!");
    })
    .catch((err) => {
      if (err) throw err;
    });
});

app.listen(4443, () => {
  console.log("Up and running! -- This is our Flights service");
});
