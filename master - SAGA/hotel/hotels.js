const express = require("express");
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.json());

const db = require("./hotelConnection");

app.post("/hotels", (req, res) => {
  let newHotel = req.body;
  console.log(newHotel);

  db.promise()
    .query(
      `INSERT INTO Hotel VALUES('NULL','${newHotel.city}', '${newHotel.hotelName}', '${newHotel.address}', ${newHotel.roomNumber}, ${newHotel.pricePerDay})`
    )
    .then(() => {
      console.log("Hotel created");
      res.status(201).send({ msg: "Created hotel" });
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get("/hotels/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const result = await db
      .promise()
      .query(`SELECT * FROM hotel WHERE id=${id}`);
    res.send(result[0]);
  } catch (error) {
    console.log(error);
  }
});

app.delete("/hotels/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const result = await db
      .promise()
      .query(`DELETE FROM hotel WHERE id=${id};`);
    res.send("Hotel successfully deleted");
  } catch (error) {
    console.log(error);
  }
});

app.get("/hotels", async (req, res) => {
  try {
    const result = await db.promise().query(`SELECT * FROM hotel`);
    res.send(result[0]);
  } catch (error) {
    console.log(error);
  }
});

app.listen("5555", () => {
  console.log("Up and running - Hotel service");
});
