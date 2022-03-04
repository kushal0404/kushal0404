require("dotenv").config();
var express = require('express');

var app = express();

app.use(express.static(__dirname));

const port = process.env.PORT;

// HOME PAGE FOR REGISTRATION
app.get('/',function(req,res)
{
  res.sendFile(__dirname + 'index.html');
});


app.use('/', require('./api/commonApi.cjs'));
app.use('/', require('./api/fileApi.cjs'));
app.use('/', require('./api/createwallet.cjs'));
app.use('/', require("./api/solanaApi.cjs"));


app.listen(port, () => console.log(`App listening on port `+port))
