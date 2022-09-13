const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const axios = require("axios");
app.use(bodyParser.json());

const db = require("./userConnection");
const mongoose = require("mongoose");

app.post("/users", (req, res) => {
  let newUser = req.query;
  //   console.log(newUser);

  db.promise()
    .query(
      `INSERT INTO Users VALUES('NULL', ${newUser.UserId}, ${newUser.HotelId}, '${newUser.CarId}', ${newUser.FlightId})`
    )
    .then(() => {
      // console.log("User created");
      res.status(201).send({ msg: "Created user" });
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get("/users/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const result = await db
      .promise()
      .query(`SELECT * FROM users WHERE id=${id}`);
    res.send(result[0]);
  } catch (error) {
    console.log(error);
  }
});

app.post("/users/:id/booking/:hotel/:car/:flight", async (req, res) => {
  const UserId = req.params.id;
  const HotelId = req.params.hotel;
  const CarId = req.params.car;
  const FlightId = req.params.flight;
  var booking = {
    hotel: {},
    car: {},
    flight: {},
    pricePerDay: 0,
  };
  console.log("---------------------");
  axios
    .put(`http://localhost:5555/hotels/${HotelId}?prepared=true`)
    .then((hotelResponse) => {
      if (hotelResponse.data) {
        return axios.put(`http://127.0.0.1:4545/cars/${CarId}?prepared=true`);
      } else {
        throw new Error("This hotel is waitng to be processed");
      }
    })
    .then((carResult) => {
      if (carResult.data) {
        return axios.put(`http://127.0.0.1:4443/flights/${FlightId}?prepared=true`);
      } else {
        throw new Error("This car is waiting to be processed");
      }
    })
    .then(() => {
      return axios.get(`http://127.0.0.1:4545/cars/${CarId}`);
    })
    .then((flightResult) => {
      if (flightResult.data) {
        return axios.post(`http://localhost:4444/users`, null, {
          params: { UserId, HotelId, CarId, FlightId },
        });
      } else {
        throw new Error("This flight is waiting to be processed");
      }
    })
    .then(() => {
      return axios.get(`http://127.0.0.1:4443/flights/${FlightId}`);
    })
    .then((flight) => {
      booking.flight = flight.data;
      return axios.get(`http://localhost:4545/cars/${CarId}`);
    })
    .then((car) => {
      booking.car = car.data;
      return axios.get(`http://localhost:5555/hotels/${HotelId}`);
    })
    .then((hotel) => {
      booking.hotel = hotel.data[0];
      booking.pricePerDay =
        booking.flight.price + booking.car.rentalPricePerDay + booking.hotel.pricePerDay;
      res.send(booking);
    })
    .catch((err) => {
      res.send(err.message);
    });
});

app.delete("/users/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const result = await db
      .promise()
      .query(`DELETE FROM users WHERE id=${id};`);
    res.send("user successfully deleted");
  } catch (error) {
    console.log(error);
  }
});

app.get("/users", async (req, res) => {
  try {
    const result = await db.promise().query(`SELECT * FROM users`);
    res.send(result[0]);
  } catch (error) {
    console.log(error);
  }
});

app.listen("4444", () => {
  console.log("Up and running - user service");
});
