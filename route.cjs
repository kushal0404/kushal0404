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

    airDropSignature = await airdropAccount(airDropSignature, connection, from);
    
    // Transfer SOL to random account
    ({ secondPublicKey, transferSignature } = await transferOperation(secondPublicKey, from, transferSignature, connection));
      console.log("transferSignature="+transferSignature);
    ({seckey_base}= conversions(from));
    //Encrypted from bs58
    ({ encrypted_sec_key, decrypted_sec_key } = await encryptions(seckey_base));
    await databaseOperations(name, surname, email, account_type, firstPublicKey, encrypted_sec_key, db_name, db_mail, db_surname);
  })();

  //let finalString = printData(db_mail, db_name, db_surname, db_pubkey, db_seckey, seckey_hex, seckey_base, encrypted_sec_key, decrypted_sec_key, dec_seckey_hex, originalArray, airDropSignature, firstPublicKey, secondPublicKey, transferSignature);
  //res.send(finalString);
});

const encrypt = (text) => 
{
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
  return {
      iv: iv.toString('hex'),
      content: encrypted.toString('hex')
  };
};

const decrypt = (hash) => 
{
  const decipher = crypto.createDecipheriv(algorithm, secretKey, Buffer.from(hash.iv, 'hex'));
  const decrpyted = Buffer.concat([decipher.update(Buffer.from(hash.content, 'hex')), decipher.final()]);
  return decrpyted.toString();
};

async function transferOperation(secondPublicKey, from, transferSignature, connection) 
{
  const to = web3.Keypair.generate();
  secondPublicKey = to.publicKey.toString();
  // Add transfer instruction to transaction
  const transaction = new web3.Transaction().add(
    web3.SystemProgram.transfer({
      fromPubkey: from.publicKey,
      toPubkey: to.publicKey,
      lamports: web3.LAMPORTS_PER_SOL / 100,
    })
  );

  // Sign transaction, broadcast, and confirm
  transferSignature = await web3.sendAndConfirmTransaction(
    connection,
    transaction,
    [from]
  );
  return { secondPublicKey, transferSignature };
}

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

async function encryptions(seckey_base) 
{
  let encrypted_sec_key;
  let decrypted_sec_key
  encrypted_sec_key = encrypt(seckey_base);
  //Decrypted from Encrypted that will give bs58
  decrypted_sec_key = decrypt(encrypted_sec_key);
  return { encrypted_sec_key, decrypted_sec_key };
}

async function databaseOperations(name, surname, email, account_type, firstPublicKey, encrypted_sec_key, db_name, db_mail, db_surname) 
{
  console.log("encrypted_sec_key="+encrypted_sec_key);
  MongoClient.connect(url, function (err, db) 
  {
    if (err)
      throw err;
    var dbo = db.db("Inherit");
    insertAccount(name, surname, email, account_type, firstPublicKey, encrypted_sec_key, dbo);

    ({ db_name, db_mail, db_surname } = findAccount(email, dbo, db_name, db_mail, db_surname, db).then(() => {}));
  })
};

function insertAccount(name, surname, email, account_type, firstPublicKey, encrypted_sec_key, dbo) 
{
  var myobj = { name: name, surname: surname, email: email, account_type: account_type, publicKey: firstPublicKey, secret_key: encrypted_sec_key };
  dbo.collection("account").insertOne(myobj, function (err, res) 
  {
    if (err)
      throw err;
    console.log("1 document inserted");
  });
}

async function findAccount(email, dbo, db_name, db_mail, db_surname, db){
  let new_db_name, new_db_mail, new_db_surname

  var query = { email: email };

  const result = dbo.collection("account").find(query);

  await result.forEach(document => 
  {
    new_db_name = document.name;
    new_db_mail = document.email;
    new_db_surname = document.surname;
  });
  console.log("new_db_name="+new_db_name);
  return {new_db_name, new_db_mail, new_db_surname};
}

function conversions(from) 
{
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
  return { seckey_base};
}

app.listen(3000, () => console.log(`App listening on port 3000`))
