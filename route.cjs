var express = require('express');
const bodyParser = require("body-parser");
const web3 = require("@solana/web3.js");
const bs58 = require('bs58');
const crypto = require('crypto');

var mongo = require('./src/js/mongo.cjs');

const algorithm = 'aes-256-ctr';
const secretKey = 'vOVH6sdmpNWjRRIqCc7rdxs01lwHzkz9';
const iv = crypto.randomBytes(16);

var app = express();
const port = 3000;

//Registration Page
app.get('/',function(req,res)
{
  res.sendFile(__dirname + '/src/html/CreateWallet.html');
});

app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static(__dirname));

app.post("/display", (req, res) =>
{
  let name=req.body.name;
  let surname=req.body.surname;
  let email=req.body.email;
  let account_type=req.body.acc_type;
  let firstPublicKey,secondPublicKey,firstSecretKey,airDropSignature,transferSignature,db_name,db_surname,db_mail,db_pubkey,db_seckey,encrypted_sec_key,decrypted_sec_key,seckey_hex,dec_seckey_hex,originalArray;

  (async () =>
  {
    // Connect to cluster
    console.log(web3.clusterApiUrl('devnet'))
    const connection = new web3.Connection(
      web3.clusterApiUrl('devnet'),
      'confirmed',
    );

    //Creating the account
    let from;
    ({ from, firstPublicKey, firstSecretKey } = createAccount(firstPublicKey, firstSecretKey));

    //airDropSignature = await airdropAccount(airDropSignature, connection, from);

    // Transfer SOL to random account
    /* ({ secondPublicKey, transferSignature } = await transferOperation(secondPublicKey, from, transferSignature, connection));
      console.log("transferSignature="+transferSignature); */
    ({seckey_base}= conversions(from));
    //Encrypted from bs58
    ({ encrypted_sec_key, decrypted_sec_key } = await encryptions(seckey_base));
     databaseOperations(name, surname, email, account_type, firstPublicKey,encrypted_sec_key, decrypted_sec_key,res);
      //console.log(response);
  })();

  //let finalString = printData(db_mail, db_name, db_surname, db_pubkey, db_seckey, seckey_hex, seckey_base, encrypted_sec_key, decrypted_sec_key, dec_seckey_hex, originalArray, airDropSignature, firstPublicKey, secondPublicKey, transferSignature);
  //res.send(finalString);
});

async function databaseOperations(name, surname, email, account_type, firstPublicKey, encrypted_sec_key, db_name, db_mail, db_surname) {
    const result = await mongo.insertAccount({name: name, surname: surname, email: email, account_type: account_type, publicKey: firstPublicKey, secret_key: encrypted_sec_key});

    const findRes = await mongo.findAccount({email: email})
    console.log("FOUND: ", findRes);
    db_name = findRes.name;
    db_surname = findRes.surname;
    db_mail = findRes.email;
};

databaseOperations(name, surname, email, account_type, firstPublicKey, encrypted_sec_key, db_name, db_mail, db_surname);
  let finalString = printData(db_mail, db_name, db_surname, db_pubkey, db_seckey, seckey_hex, seckey_base, encrypted_sec_key, decrypted_sec_key, dec_seckey_hex, originalArray, airDropSignature, firstPublicKey, secondPublicKey, transferSignature);
  res.send(finalString);
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


function printData(db_mail, db_name, db_surname, db_pubkey, db_seckey, seckey_hex, seckey_base, encrypted_sec_key, decrypted_sec_key, dec_seckey_hex, originalArray, airDropSignature, firstPublicKey, secondPublicKey, transferSignature) {
  let finalString = "<h1>Account Created Successfully!</h1>";
  finalString += "</br>";
  finalString += "Name in DB";
  finalString += db_name;
  finalString += "</br>";
  finalString += "Surname in DB";
  finalString += db_surname;
  finalString += "</br>";
  finalString += "Email in DB";
  finalString += db_mail;
  finalString += "</br>";
  finalString += "Secret Key in HEX";
  finalString += "</br>";
  finalString += seckey_hex;
  finalString += "</br>";
  finalString += "Secret Key in BS58";
  finalString += "</br>";
  finalString += seckey_base;
  finalString += "</br>";
  finalString += "Secret Key Encrypted ";
  finalString += "</br>";
  finalString += encrypted_sec_key;
  finalString += "</br>";
  finalString += "Secret Key in BS58";
  finalString += "</br>";
  finalString += decrypted_sec_key;
  finalString += "</br>";
  finalString += "Secret Key in HEX";
  finalString += "</br>";
  finalString += dec_seckey_hex;
  finalString += "</br>";
  finalString += "Secret Key array ";
  finalString += "</br>";
  finalString += originalArray;
  finalString += "</br>";
  finalString += "Airdrop of 1 SOL is successful.";
  finalString += "</br>";
  finalString += "Signature:";
  finalString += "</br>";
  finalString += airDropSignature;
  finalString += "</br>";
  finalString += "Transfer from " + firstPublicKey + " to " + secondPublicKey + " is successful.";
  finalString += "</br>";
  finalString += "Signature:";
  finalString += "</br>";
  finalString += transferSignature;
  return finalString;
}

function encryptions(seckey_base) {
  let encrypted_sec_key = encrypt(seckey_base);

  //Decrypted from Encrypted that will give bs58
  let decrypted_sec_key = decrypt(encrypted_sec_key);
  return { encrypted_sec_key, decrypted_sec_key };
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
  return { seckey_base, seckey_hex, dec_seckey_hex, originalArray };
}

app.listen(3000, () => console.log(`App listening on port 3000`))
