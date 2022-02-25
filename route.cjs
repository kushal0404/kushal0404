var express = require('express');
var MongoClient = require('mongodb').MongoClient;
const bodyParser = require("body-parser");
const bs58 = require('bs58');
const crypto = require('crypto');
const web3 = require("@solana/web3.js");

// IMPORT MONGODB MODULE
const mongo = require('./src/js/mongo.cjs');

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
const encrypt = (text) => {
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
  return {
      iv: iv.toString('hex'),
      content: encrypted.toString('hex')
  };
};
const decrypt = (hash) => {
  const decipher = crypto.createDecipheriv(algorithm, secretKey, Buffer.from(hash.iv, 'hex'));
  const decrpyted = Buffer.concat([decipher.update(Buffer.from(hash.content, 'hex')), decipher.final()]);
  return decrpyted.toString();
};


// SOL AIRDROP FUNCTION (NOT USED IN THIS EXAMPLE)
async function airdropAccount(airDropSignature, connection, from) {
  airDropSignature = await connection.requestAirdrop(
    from.publicKey,
    web3.LAMPORTS_PER_SOL
  );

  await connection.confirmTransaction(airDropSignature);
  return airDropSignature;
}

function createAccount(firstPublicKey, firstSecretKey)
{
  const from = web3.Keypair.generate();
  firstPublicKey = from.publicKey.toString();
  firstSecretKey = from.secretKey.toString();
  return { from, firstPublicKey, firstSecretKey };
}


async function encryptions(seckey_hex)
{
  let encrypted_sec_key;
  let decrypted_sec_key
  encrypted_sec_key = encrypt(seckey_hex);

  //Decrypted from Encrypted that will give hex
  //decrypted_sec_key = decrypt(encrypted_sec_key);

  return { encrypted_sec_key };
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
  let dec_seckey_hex = bs58.decode(seckey_base).toString('hex');

  const fromHexString = dec_seckey_hex => new Uint8Array(dec_seckey_hex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
  let originalArray = fromHexString(dec_seckey_hex);

  return { seckey_hex };
}

app.use('/', require('./api/commonApi'));
app.use('/fileApi', require('./api/fileApi'));
app.post('/createwallet', require('./api/createwallet.cjs'));

app.listen(3000, () => console.log(`App listening on port 3000`))
