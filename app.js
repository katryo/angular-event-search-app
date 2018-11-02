"use strict";

if (process.env.NODE_ENV !== "production") {
  require("dotenv").load();
}

const express = require("express");
const querystring = require("querystring");
const geohash = require("ngeohash");
const fetch = require("node-fetch");

const SpotifyWebApi = require('spotify-web-api-node');

const app = express();

app.get("/", (req, res) => {
  res
    .status(200)
    .send("Hello, world!")
    .end();
});

async function fetchEvents(lat, lng, keyword, category, radius, unit) {
  const code = geohash.encode(lat, lng);

  const baseUrl = "https://app.ticketmaster.com/discovery/v2/events.json?";

  let qs;
  if (category === 'all') {
    qs = querystring.stringify({
      apikey: process.env.TICKET_CONSUMER_KEY,
      keyword: keyword,
      category: category,
      radius: radius,
      unit: unit,
      geoPoint: code
    });
  } else {
    let segmentId;
    switch (category) {
      case 'music':
        {
          segmentId = 'KZFzniwnSyZfZ7v7nJ';
          break;
        }

      case 'sports':
        {
          segmentId = 'KZFzniwnSyZfZ7v7nE';
          break;
        }

      case 'arts':
        {
          segmentId = 'KZFzniwnSyZfZ7v7na';
          break;
        }

      case 'film':
        {
          segmentId = 'KZFzniwnSyZfZ7v7nn';
          break;
        }

      case 'miscellaneous':
        {
          segmentId = 'KZFzniwnSyZfZ7v7n1';
          break;
        }
    }
    qs = querystring.stringify({
      apikey: process.env.TICKET_CONSUMER_KEY,
      keyword: keyword,
      segmentId: segmentId,
      radius: radius,
      unit: unit,
      geoPoint: code
    });
  }
  const url = baseUrl + qs;

  const response = await fetch(url);
  const result = await response.json();
  if (result._embedded) {
    return result._embedded.events;
  } else {
    return [];
  }
}

async function fetchSuggestions(keyword) {
  const baseUrl = 'https://app.ticketmaster.com/discovery/v2/suggest?';
  const qs = querystring.stringify({
    apikey: process.env.TICKET_CONSUMER_KEY,
    keyword: keyword
  });

  const url = baseUrl + qs;

  const response = await fetch(url);
  const result = await response.json();
  if (result._embedded) {
    return result._embedded.attractions;
  } else {
    return [];
  }
}

async function fetchVenueId(query) {
  const baseUrl = 'https://api.songkick.com/api/3.0/search/venues.json?';
  const qs = querystring.stringify({
    apikey: process.env.SONGKICK_KEY,
    query: query
  });

  const url = baseUrl + qs;

  const response = await fetch(url);
  const result = await response.json();
  if (result.resultsPage && result.resultsPage.status === 'ok' && result.resultsPage.results.venue.length > 0) {
    return result.resultsPage.results.venue[0].id;
  } else {
    return -1;
  }
}

async function fetchLatLngFromAddress(address) {
  const app_key = process.env.G_MAP_API_KEY;
  const baseUrl = 'https://maps.googleapis.com/maps/api/geocode/json?';
  const qs = querystring.stringify({
    address: address,
    key: app_key
  })
  const url = baseUrl + qs;
  const response = await fetch(url);
  const result = await response.json();
  return result
}

async function fetchUpcomingEvents(id) {
  const baseUrl = `https://api.songkick.com/api/3.0/venues/${id}/calendar.json?`;
  const qs = querystring.stringify({
    apikey: process.env.SONGKICK_KEY,
  });

  const url = baseUrl + qs;

  const response = await fetch(url);
  const result = await response.json();
  if (result.resultsPage && result.resultsPage.status === 'ok') {
    return result.resultsPage.results.event;
  } else {
    return [];
  }
}

async function setSpotifyToken(spotifyApi, data, name) {
  await spotifyApi.setAccessToken(data.body['access_token']);
  return await spotifyApi.searchArtists(name);
}

async function fetchArtistDetail(name) {
  const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_ID,
    clientSecret: process.env.SPOTIFY_SECRET,
    redirectUri: 'http://angular-ticket-usc.appspot.com/callback'
  });

  try {
    return await spotifyApi.searchArtists(name);
  } catch (e) {
    if (e.statusCode === 401) {
      try {
        const data = await spotifyApi.clientCredentialsGrant();
        return setSpotifyToken(spotifyApi, data, name);
      } catch (e2) {
        console.log(e2);
      }
      // spotifyApi.clientCredentialsGrant().then(
      //   function (data) {
      //     console.log(data);
      //     spotifyApi.setAccessToken(data.body['access_token']);
      //   },
      //   function (e) {
      //     console.log(e);
      //     return {};
      //   }
      // ).then(() => {
      //   spotifyApi.searchArtists(name);
      // }).catch(e)(() => {
      //   console.log(e);
      // });
    }
  }
}

app.get("/api/artists", (req, res) => {
  const query = req.query.query;
  fetchArtistDetail(query).then(data => {
    res.status(200).json({
      artists: data.body.artists.items,
      status: 'success'
    })
  }).catch(e => {
    console.log(e);
    res.status(500).json({
      artists: [],
      status: "failure"
    });
  })
});

app.get("/api/upcoming", (req, res) => {
  const query = req.query.query;
  fetchVenueId(query).then(id => {
    if (id === -1) {
      res.status(200).json({
        upcomingEvents: [],
        status: 'success'
      })
    } else {
      fetchUpcomingEvents(id).then(events => {
        console.log(events);
        res.status(200).json({
          upcomingEvents: events,
          status: 'success'
        });
      })
    }
  }).catch(e => {
    console.log(e);
    console.log(failure);
    res.status(500).json({
      events: [],
      status: "failure"
    });
  })
});

app.get("/api/events", (req, res) => {
  const lat = parseFloat(req.query.lat);
  const lng = parseFloat(req.query.lng);
  const keyword = req.query.keyword;
  const category = req.query.category;
  const radius = parseInt(req.query.radius);
  const unit = req.query.unit;
  fetchEvents(lat, lng, keyword, category, radius, unit)
    .then(events => {
      res.status(200).json({
        events: events,
        status: "success"
      });
    })
    .catch(e => {
      console.log(e);
      console.log(failure);
      res.status(500).json({
        events: [],
        status: "failure"
      });
    });
});

app.get('/api/suggestions', (req, res) => {
  fetchSuggestions(req.query.keyword).then(attractions => {
      res.status(200).json({
        attractions: attractions,
        status: 'success'
      });
    })
    .catch(e => {
      console.log(e);
      res.status(500).json({
        attractions: [],
        status: "failure"
      });
    });
})

app.get('/api/latlng', (req, res) => {
  fetchLatLngFromAddress(req.query.address).then(result => {
      const inter = result.results[0].geometry.location;
      const lat = inter.lat;
      const lng = inter.lng;
      res.status(200).json({
        lat: lat,
        lng: lng,
        status: 'success'
      });
    })
    .catch(e => {
      res.status(500).json({
        lat: 0.0,
        lng: 0.0,
        status: "failure"
      });
    });
})

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