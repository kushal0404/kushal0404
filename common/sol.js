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

// memo transaction sol
module.exports.memoTransaction = async (fromPublicKey, toPublicKey, memoObj) =>
{
  let connection =  makeSolConnection();
  let transaction = new web3.Transaction();
  let memoString="memo_id:"+memoObj._id+",\n";
  memoString += "lawyer_name:"+memoObj.lawyer_name+",\n";
  memoString += "client_name:"+memoObj.client_name+",\n";
  memoString += "lawyer_postal_code:"+memoObj.lawyer_postal_code+",\n";
  memoString += "client_postal_code:"+memoObj.client_postal_code+",\n";
  memoString += "type_of_doc:"+memoObj.type_of_doc+",\n";
  memoString += "date_of_sign:"+memoObj.date_of_sign+",\n";
  memoString += "mode_of_sign:"+memoObj.mode_of_sign+",\n";
  memoString += "hash_of_file:"+memoObj.hash_of_file+",\n";
  memoString += "file_id:"+memoObj.file_id+",\n";
  memoString += "file_version:"+memoObj.file_version+",\n";
  memoString += "executor_name:"+memoObj.executor_name+",\n";

  let type = web3.SYSTEM_INSTRUCTION_LAYOUTS.Transfer;
   let data = Buffer.alloc(type.layout.span);
   let layoutFields = Object.assign({instruction: type.index});
   type.layout.encode(layoutFields, data);

    let recentBlockhash = await connection.getRecentBlockhash();

    let messageParams = {
        accountKeys: [
            fromPublicKey.publicKey.toString(),
            toPublicKey.publicKey.toString(),
            web3.SystemProgram.programId.toString()
        ],
        header: {
            numReadonlySignedAccounts: 0,
            numReadonlyUnsignedAccounts: 1,
            numRequiredSignatures: 1,
        },
        instructions: [
            {
            accounts: [0, 1],
            data: bs58.encode(data),
            programIdIndex: 2,
            },
        ],
        recentBlockhash,
    };

    let message = new web3.Message(messageParams);

    transaction = web3.Transaction.populate(
        message,
        [fromPublicKey.publicKey.toString()]
    );

    const instruction = new web3.TransactionInstruction(
        {
           keys: [],
           programId: new web3.PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),
           data: Buffer.from(memoString)
         }
   );
    var signature = await web3.sendAndConfirmTransaction(connection, transaction.add(instruction), [fromPublicKey]);
    let response=await connection.getConfirmedTransaction(signature);
    let responseObj={
        transact_signature:signature,
        transact_response:response
    }
    return responseObj;
};
