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
  //  try
    //{
        //logic
        var fromSecKey = '';

        const private_key = db.getSecretKey("account_data", fromPubkey)

        private_key.then(async pkey => {
          //console.log("pkey", pkey)
          //console.log(tools.decryptSecretKey(pkey.private_key));
          fromSecKey = tools.decryptSecretKey(pkey.private_key);
          //console.log("seckey", typeof fromSecKey)

          skey = conversions(fromSecKey)
          //console.log("skey: ", skey)
          from = web3.Keypair.fromSecretKey(skey.originalArray);

        //console.log("from: ", fromSecKey)
        //let seedFrom = Uint8Array.from([188,69,10,38,34,102,99,162,222,6,118,179,16,134,221,139,16,112,25,151,250,47,91,211,165,10,30,45,210,79,126,101,253,83,164,165,41,124,35,126,159,135,88,18,66,20,238,239,107,97,223,45,61,49,102,80,152,196,209,155,5,57,32,133])
        //from = web3.Keypair.fromSecretKey(seedFrom);


        /*let seedTo = Uint8Array.from([248,166,245,250,171,49,69,81,233,61,
                                    218,85,149,134,138,56,54,65,37,118,24,
                                    39,53,78,136,91,61,225,208,191,52,169,
                                    235,151,110,102,216,213,37,19,49,12,198,
                                    34,5,112,49,33,120,213,20,225,28,172,57,
                                    14,196,100,137,197,92,191,96,26])*/
        //let to = web3.Keypair.fromSecretKey(seedTo);
        //let to = new web3.PublicKey(toPublicKey);
        //console.log("to: ", to)
        //console.log(web3.clusterApiUrl('devnet'))
        const connection = new web3.Connection(
          web3.clusterApiUrl('devnet'),
          'confirmed',
        );

        fromPubKey = from.publicKey
        toPubKey = new web3.PublicKey(toPublicKey);
        //console.log(toPubKey)

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
        console.log("transfer", transferSignature)
        return { transferSignature };
      })
/*    }catch(err){
        return err;
    }*/
};
