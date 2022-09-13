const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const axios = require("axios");
app.use(bodyParser.json());

const db = require("./userConnection");

let bookings = [];

app.post("/users", (req, res) => {
  let newUser = req.query;
  db.promise()
    .query(
      `INSERT INTO Users VALUES('NULL', ${newUser.UserId}, ${newUser.HotelId}, '${newUser.CarId}', ${newUser.FlightId})`
    )
    .then(() => {
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

app.post("/users/:id/booking/:hotel/:car/:flight", (req, res) => {
  const UserId = req.params.id;
  const HotelId = req.params.hotel;
  const CarId = req.params.car;
  const FlightId = req.params.flight;

  const booking = {
    hotel: {},
    car: {},
    flight: {},
    pricePerDay: 0,
  };

  axios
    .post("http://localhost:4444/users", null, {
      params: {
        UserId,
        HotelId,
        CarId,
        FlightId,
      },
    })
    .then((response) => {
      console.log(response.status);
    })
    .catch((err) => console.warn(err));
  console.log("--------------");

  axios
    .get(`http://localhost:5555/hotels/${HotelId}`)
    .then(async (hotelResponse) => {
      booking.hotel = hotelResponse.data[0];
      return wait("hotel");
    })
    .then((promiseResult) => {
      if (promiseResult) {
        return axios.get(`http://localhost:4545/cars/${CarId}`);
      }
    })
    .then(async (carResponse) => {
      booking.car = carResponse.data;
      return wait("car");
    })
    .then((promiseResult) => {
      if (promiseResult) {
        return axios.get(`http://localhost:4443/flights/${FlightId}`);
      }
    })
    .then((flightResponse) => {
      booking.flight = flightResponse.data;
      booking.pricePerDay =
        booking.flight.price + booking.car.rentalPricePerDay + booking.hotel.pricePerDay;
    })
    .then((promiseResult) => {
      if (promiseResult) res.send(booking);
    })
    .catch((err) => {
      res.send(err.message);
    })
    .finally(() => (bookings = []));
});

function wait(purpose) {
  return new Promise(function (resolve, reject) {
    setTimeout(() => {
      bookings.push(purpose);
      if (Math.random() < 0.5) {
        deleteLastBooking();
        bookings
          .slice()
          .reverse()
          .forEach((purpose) => console.log(`${purpose} aborted!`));
        reject({ message: "ABORT " + bookings.join(" and ") });
      } else {
        console.log(`Succesfully booked ${purpose}`);
        resolve(true);
      }
    }, 1000);
  });
}

async function deleteLastBooking() {
  const res = await axios.get(`http://localhost:4444/users`);
  const id = res.data[res.data.length - 1].id;
  axios.delete(`http://localhost:4444/users/${id}`);
}

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
