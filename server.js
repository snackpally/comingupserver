require("dotenv").config();
const express = require("express");
const app = express();
const port = process.env.PORT || 3001;
const cors = require("cors");
const url = require("url");
const bodyparser = require("body-parser");
const axios = require("axios");

app.use(cors("*"));
app.use(bodyparser.json());

//Spotify Endpoints
var reUrl = `http://localhost:${process.env.PORT}/callback`;
app.get("/login", function(req, res) {
  var scopes = "user-read-private user-read-email";
  res.redirect(
    "https://accounts.spotify.com/authorize" +
      "?response_type=code" +
      "&client_id=" +
      process.env.CLIENTID +
      (scopes ? "&scope=" + encodeURIComponent(scopes) : "") +
      "&redirect_uri=" +
      encodeURIComponent(reUrl)
  );
});

app.get("/callback", (req, res) => {
  let allUrl = url.parse(req.url).search.split("=")[1];
  res.send({
    token: allUrl,
    status: 200
  });
});

//Data Api Endpoints
app.post("/events", (req, res) => {
  //move api calls into here req.body will be json of values for query string
  console.log(typeof req.body.startDate);
  console.log(process.env.VUE_APP_TKAPIKEY);
  var TKurl = `https://app.ticketmaster.com/discovery/v2/events.json?radius=1000&startDateTime=${req.body.startDate}&endDateTime=${req.body.endDate}&city=${req.body.location}&apikey=${process.env.VUE_APP_TKAPIKEY}`;
  console.log(TKurl);
  axios
    .get(TKurl, { timeout: 10000 })
    .then(function(apires) {
      if (apires.data._embedded == undefined || null) {
        res.body = null;
        res.send(res.body);
      } else {
        var events = apires.data._embedded.events;
        res.body = events.filter(
          x => x.classifications[0].segment.name == "Music"
        );
        res.send(res.body);
      }
    })
    .catch(function(apires) {
      if (apires instanceof Error) {
        console.log("Error: ", apires.message);
      }
    });
});

app.listen(port, () => {
  console.log(`app is listening on port ${port}`);
});
