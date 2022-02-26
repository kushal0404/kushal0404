var express = require('express');

var app = express();

app.use(express.static(__dirname));

const port = 3000;

// HOME PAGE FOR REGISTRATION
app.get('/',function(req,res)
{
  console.log("------------------------------------"+__dirname);
  res.sendFile(__dirname + '/src/html/CreateWallet.html');
});



app.use('/', require('./api/commonApi'));
app.use('/fileApi', require('./api/fileApi.cjs'));
app.post('/createwallet', require('./api/createwallet.cjs'));
app.get('/transfer', require("./api/solanaApi.js"));

app.listen(3000, () => console.log(`App listening on port 3000`))
