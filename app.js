'use strict';

const express = require('express');

const app = express();

app.get('/', (req, res) => {
  res.status(200).send('Hello, world!').end();
});

app.get('/api/', (req, res) => {
  res.status(200).send('Hello, api!').end();
});

app.get('/api/:id', (req, res) => {
  res.status(200).send(`Hello, ${req.params.id}`).end();
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});