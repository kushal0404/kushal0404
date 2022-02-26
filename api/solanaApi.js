const { Router } = require('express');
const routerObj = new Router();
const sol = require("../common/sol.js")
const df = require("../config/define.js")
const bodyParser = require("body-parser");

routerObj.use(bodyParser.urlencoded({ extended: true }));

routerObj.get('/transfer', async function(req, res) {

  // public keys
  fromPubKey = "7XYNNr9F8yCx6ER9Gazm5cXX2sTTByjNMbfe8jVo91wC"; // admin account stored in mongo
  toPubKey = "8iKFmspaAhUstN6rKTfM6wYmBUPmCrZy7YNrfksyjqeT";  // kushal's account (lawyer) stored in mongo

  sig = await sol.transferSOL(fromPubKey, toPubKey);
  res.send(df.rtnformat(200, "Transfered"));
  res.end();
});

module.exports = routerObj;
