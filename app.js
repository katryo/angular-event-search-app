'use strict';

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').load();
}

const express = require('express');
const querystring = require('querystring');
const geohash = require('ngeohash');

const app = express();

app.get('/', (req, res) => {
  res.status(200).send('Hello, world!').end();
});

app.get('/api/events', (req, res) => {
  const lat = parseFloat(req.query.lat);
  const lng = parseFloat(req.query.lng);
  const code = geohash.encode(lat, lng);

  const baseUrl = 'https://app.ticketmaster.com/discovery/v2/events.json';

  const qs = querystring.stringify({
    apikey: process.env.TICKET_CONSUMER_KEY,
    keyword: "football",
    radius: '10',
    unit: 'mile',
    geoPoint: code
  });
  const url = baseUrl + qs;
  res.status(200).send('Hello, api!' + url).end();
});

app.get('/api/:id', (req, res) => {
  res.status(200).send(`Hello, ${req.params.id}`).end();
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});