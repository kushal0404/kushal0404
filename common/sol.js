const {Buffer} = require('buffer');
const web3 = require("@solana/web3.js");
var df = require('../config/define');
const db = require("./db.js");
const tools = require("./tools.js")
const bs58 = require('bs58');

// making solana conncetion
function makeSolConnection(){
    return new web3.Connection(web3.clusterApiUrl(df.solConnection));
}

// create account on Solana
module.exports.makeSolAccount = async () => {
    try{
        let payer = web3.Keypair.generate();
        makeSolConnection();
        return payer;
    }catch(err){
        return err;
    }
};

// Check account balance on Solana
module.exports.checkAccountBalance = async (publickey) => {
    try{
        return await makeSolConnection().getBalance(publickey);
    }catch(err){
        return err;
    }
};

function conversions(from) {
  //HEX from Uint8
  //HEX representation of secret key,because from.secretKey gives us Uint8Array
  //let seckey_hex = Buffer.from(from.secretKey).toString('hex');

  //bs58 from Uint8
  //base58 representation of secret key,because from.secretKey gives us Uint8Array
  //let seckey_base = bs58.encode(from.secretKey);

  //HEX from bs58
  //HEX from bs58 representation of secret key
  let dec_seckey_hex = bs58.decode(from).toString('hex');

  const fromHexString = dec_seckey_hex => new Uint8Array(dec_seckey_hex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
  let originalArray = fromHexString(dec_seckey_hex);

  return { originalArray };
}

// transfer sol
module.exports.transferSOL = async (fromPubkey, toPublicKey) =>
{
    try
    {
        //logic
        //initialize secret key variable
        var fromSecKey = '';

        // fetch secret key for 'from' account from mongo
        const private_key = db.getSecretKey("account_data", fromPubkey)

        private_key.then(async pkey => {

          // decrypt private key
          fromSecKey = tools.decryptSecretKey(pkey.private_key);

          // convert private key from bs58 to unit array
          skey = conversions(fromSecKey)

          // create solana keypair object
          from = web3.Keypair.fromSecretKey(skey.originalArray);

          // create solana connection
          const connection = new web3.Connection(
            web3.clusterApiUrl('devnet'),
            'confirmed',
          );


          // define publick keys for from and to account
          fromPubKey = from.publicKey
          toPubKey = new web3.PublicKey(toPublicKey);

          // Add transfer instruction to transaction
          const transaction = new web3.Transaction().add(
            web3.SystemProgram.transfer({
              fromPubkey: fromPubKey,
              toPubkey: toPubKey,
              lamports: web3.LAMPORTS_PER_SOL / 100,
            })
          );

          // Sign transaction, broadcast, and confirm
          const transferSignature = await web3.sendAndConfirmTransaction(
            connection,
            transaction,
            [from]
          );
          return { transferSignature };
          // transfer can be checked on solana explorer by searching for
          // the from/to account and looking at the transaction
      });
    } catch(err) {
        return err;
    }
};
