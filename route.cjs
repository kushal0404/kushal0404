var express = require('express');
var MongoClient = require('mongodb').MongoClient;
const bodyParser = require("body-parser");
const bs58 = require('bs58');
const crypto = require('crypto');
const web3 = require("@solana/web3.js");

// IMPORT MONGODB MODULE
const sol = require('./common/sol.js');

//const solanaOps = require('./src/js/solanaOps.cjs');

const algorithm = 'aes-256-ctr';
const secretKey = 'vOVH6sdmpNWjRRIqCc7rdxs01lwHzkz9';
const iv = crypto.randomBytes(16);

var app = express();
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static(__dirname));

const port = 3000;

// HOME PAGE FOR REGISTRATION
app.get('/',function(req,res)
{
  console.log("------------------------------------"+__dirname);
  res.sendFile(__dirname + '/src/html/CreateWallet.html');
});


// SOL AIRDROP FUNCTION (NOT USED IN THIS EXAMPLE)
async function airdropAccount(airDropSignature, connection, from) {
  airDropSignature = await connection.requestAirdrop(
    from.publicKey,
    web3.LAMPORTS_PER_SOL
  );

  await connection.confirmTransaction(airDropSignature);
  return airDropSignature;
}



async function databaseOperations(params)
{
    var buildInsertObjPromise= ()=>{
      return new Promise((resolve,reject) =>{
        buildInsertObj(params).then((insertObj)=>{
          resolve(insertObj)
        })
      })
    };

    buildInsertObjPromise().then((insertObj)=>
    {
      // USING PROMISES FOR TESTING PURPOSES
      // AIM OF THIS USAGE IS TO EXECUTE CODE SEQUENTIALLY i.e. AFTER THE INSERTION OF DATA
      var insertPromise = () => {
        return new Promise((resolve,reject) =>
        {
          console.log("Insert start");
          mongo.insertAccount(insertObj).then((insertResult) => {
            console.log(insertResult)
            resolve("Insert Completed")
          });
        })
      };

      insertPromise().then((message) =>
      {
        console.log(message);
        console.log("Find Started "+insertObj.user_email);
        mongo.findAccount({ user_email: insertObj.user_email }).then((result) => {
          printData(result,params);
          console.log("Find Ended")
        })
      });
    })
}





// PRINTS DATA TO THE ACCOUNT PAGE
function printData(result,params)
{
  let finalString ="<h1>Account Created Successfully!</h1>";
  finalString += "</br>";
  finalString += "Name";
  finalString += "</br>";
  finalString += result.user_name;
  finalString += "</br>";
  finalString += "Surname";
  finalString += "</br>";
  finalString += result.user_surname;
  finalString += "</br>";
  finalString += "Email";
  finalString += "</br>";
  finalString += result.user_email;
  finalString += "</br>";
  finalString += "Public Key";
  finalString += "</br>";
  finalString += result.public_key;
  finalString += "</br>";
  finalString += "Secret Key";
  finalString += "</br>";
  finalString += params.decrypted_sec_key;
  finalString += "</br>";
  params.res.send(finalString);
}

function getBalance(connection,fromPubkey)
{
  return connection.getBalance(fromPubkey);
}

function conversions(from) {
  //HEX from Uint8
  //HEX representation of secret key,because from.secretKey gives us Uint8Array
  let seckey_hex = Buffer.from(from.secretKey).toString('hex');

  //bs58 from Uint8
  //base58 representation of secret key,because from.secretKey gives us Uint8Array
  let seckey_base = bs58.encode(from.secretKey);

  //HEX from bs58
  //HEX from bs58 representation of secret key
  let dec_seckey_hex = bs58.decode(from).toString('hex');

  const fromHexString = dec_seckey_hex => new Uint8Array(dec_seckey_hex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
  let originalArray = fromHexString(dec_seckey_hex);

  return { originalArray };
}

app.use('/', require('./api/commonApi'));
app.use('/fileApi', require('./api/fileApi'));
app.post('/createwallet', require('./api/createwallet.cjs'));
app.get('/transfer', require("./api/solanaApi.js"));

app.listen(3000, () => console.log(`App listening on port 3000`))
