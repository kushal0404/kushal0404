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
module.exports.transferSOL = async (from, to, solToTransfer) =>
{
  let transaction = new web3.Transaction();
  // Add an instruction to execute
  transaction.add(web3.SystemProgram.transfer({
    fromPubkey: from.publicKey,
    toPubkey: to.publicKey,
    lamports: solToTransfer,
  }));
  let signature=await web3.sendAndConfirmTransaction(makeSolConnection(), transaction, [from]);
  return signature;
};
