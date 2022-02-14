var express = require('express');
var MongoClient = require('mongodb').MongoClient;
const bodyParser = require("body-parser");
const web3 = require("@solana/web3.js");
const bs58 = require('bs58');
const crypto = require('crypto');

const algorithm = 'aes-256-ctr';
const secretKey = 'vOVH6sdmpNWjRRIqCc7rdxs01lwHzkz9';
const iv = crypto.randomBytes(16);
var url = "mongodb+srv://admin:admin@cluster0.fozkz.mongodb.net/Inherit?retryWrites=true&w=majority";

var app = express();
const port = 3000;

app.get('/',function(req,res)
{
  console.log("------------------------------------"+__dirname);
  res.sendFile(__dirname + '/CreateWallet.html');
});

app.use(bodyParser.urlencoded({ extended: true }))

app.use(express.static(__dirname));

app.post("/display", (req, res) => {

  let name=req.body.name;
  let surname=req.body.surname;
  let email=req.body.email;
  let account_type=req.body.acc_type;
  let firstPublicKey,secondPublicKey,firstSecretKey,airDropSignature,transferSignature,db_name,db_surname,db_mail,db_pubkey,db_seckey,encrypted_sec_key,decrypted_sec_key,seckey_hex,dec_seckey_hex,originalArray;

  (async () => {
    // Connect to cluster
    console.log(web3.clusterApiUrl('devnet'))
    const connection = new web3.Connection(
      web3.clusterApiUrl('devnet'),
      'confirmed',
    );

    const from = web3.Keypair.generate();
    firstPublicKey=from.publicKey.toString();
    firstSecretKey=from.secretKey.toString();

    ({ seckey_base, seckey_hex, dec_seckey_hex, originalArray } = conversions(from));

    airDropSignature = await connection.requestAirdrop(
      from.publicKey,
      web3.LAMPORTS_PER_SOL,
    );
    await connection.confirmTransaction(airDropSignature);
      console.log(airDropSignature);
    // Generate a new random public key
    const to = web3.Keypair.generate();
    secondPublicKey=to.publicKey.toString();
    // Add transfer instruction to transaction
    const transaction = new web3.Transaction().add(
    web3.SystemProgram.transfer({
      fromPubkey: from.publicKey,
      toPubkey: to.publicKey,
      lamports: web3.LAMPORTS_PER_SOL / 100,
    }),
  );

    // Sign transaction, broadcast, and confirm
  transferSignature = await web3.sendAndConfirmTransaction(
    connection,
    transaction,
    [from],
  );

  //Encrypted from bs58
  ({ encrypted_sec_key, decrypted_sec_key } = encryptions(seckey_base));

})();


function databaseOperations(name, surname, email, account_type, firstPublicKey, encrypted_sec_key, db_name, db_mail, db_surname) {
  MongoClient.connect(url, function (err, db) {
    if (err)
      throw err;
    var dbo = db.db("Inherit");
    insertAccount(name, surname, email, account_type, firstPublicKey, encrypted_sec_key, dbo);

    ({ db_name, db_mail, db_surname } = findAccount(email, dbo, db_name, db_mail, db_surname, db).then(() => {
    })
  );
})};

async function findAccount(email, dbo, db_name, db_mail, db_surname, db){
    let new_db_name, new_db_mail, new_db_surname

    var query = { email: email };

    const result = dbo.collection("account").find(query);

    await result.forEach(document => {
      console.log("---------------------email ---------------------" + document.email);
      new_db_name = document.name;
      new_db_mail = document.email;
      new_db_surname = document.surname;
    });
    console.log("IN DB NAME: ", new_db_name);
    console.log("\nIN DB MAIL: ", new_db_mail);
    console.log("\nIN DB SURNAME: ", new_db_surname);

    return {new_db_name, new_db_mail, new_db_surname};
}


function insertAccount(name, surname, email, account_type, firstPublicKey, encrypted_sec_key, dbo) {
  var myobj = { name: name, surname: surname, email: email, account_type: account_type, publicKey: firstPublicKey, secret_key: encrypted_sec_key };
  dbo.collection("account").insertOne(myobj, function (err, res) {
    if (err)
      throw err;
    console.log("1 document inserted");
  });
}

databaseOperations(name, surname, email, account_type, firstPublicKey, encrypted_sec_key, db_name, db_mail, db_surname);
  console.log("db_mail:"+db_mail);
  console.log("db_name:"+db_name);
  console.log("db_surname:"+db_surname);
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
