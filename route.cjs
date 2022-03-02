var express = require('express');

var app = express();

app.use(express.static(__dirname));

const port = 3000;

// HOME PAGE FOR REGISTRATION
app.get('/',function(req,res)
{
  res.sendFile(__dirname + 'index.html');
});


app.use('/', require('./api/commonApi.cjs'));
app.use('/', require('./api/fileApi.cjs'));
app.use('/', require('./api/createwallet.cjs'));
app.use('/', require("./api/solanaApi.cjs"));


app.listen(3000, () => console.log(`App listening on port 3000`))
