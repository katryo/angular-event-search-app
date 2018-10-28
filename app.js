"use strict";

if (process.env.NODE_ENV !== "production") {
  require("dotenv").load();
}

const express = require("express");
const querystring = require("querystring");
const geohash = require("ngeohash");
const fetch = require("node-fetch");

const app = express();

app.get("/", (req, res) => {
  res
    .status(200)
    .send("Hello, world!")
    .end();
});

async function fetchEvents(lat, lng, keyword) {
  const code = geohash.encode(lat, lng);

  const baseUrl = "https://app.ticketmaster.com/discovery/v2/events.json?";

  const qs = querystring.stringify({
    apikey: process.env.TICKET_CONSUMER_KEY,
    keyword: keyword,
    radius: "10",
    unit: "miles",
    geoPoint: code
  });
  const url = baseUrl + qs;

  const response = await fetch(url);
  const result = await response.json();
  const events = result._embedded.events;
  return events;
}

app.get("/api/events", (req, res) => {
  const lat = parseFloat(req.query.lat);
  const lng = parseFloat(req.query.lng);
  fetchEvents(lat, lng, "football")
    .then(events => {
      res.status(200).json({ events: events, status: "success" });
    })
    .catch(e => {
      res.status(500).json({ events: [], status: "failure" });
    });
});

app.get("/api/:id", (req, res) => {
  res
    .status(200)
    .send(`Hello, ${req.params.id}`)
    .end();
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log("Press Ctrl+C to quit.");
});
