const { Router } = require('express');
const routerObj = new Router();
const sol = require("../common/sol.js")
const df = require("../config/define.js")
const bodyParser = require("body-parser");

routerObj.use(bodyParser.urlencoded({ extended: true }));

routerObj.get('/transfer', async function(req, res) {
  sig = await sol.transferSOL("8iKFmspaAhUstN6rKTfM6wYmBUPmCrZy7YNrfksyjqeT", "BDKEVuHufbtZe4Q25kCyzWxZ4C5TqyVz8BEctnLvvS8u");
  //sig.then(res => console.log("res", res))
  console.log("sig", sig);
  res.send(df.rtnformat(200, "Transfered", {"signature": sig}));
  res.end();
});

module.exports = routerObj;
