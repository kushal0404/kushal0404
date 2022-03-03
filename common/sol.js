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
module.exports.transferSOL = async (from, to, solToTransfer, metaObj) =>
{
  let transaction = new web3.Transaction();
  let connection =  makeSolConnection();
  let memoString = buildmemostring(metaObj);
  // Add an instruction to execute
  transaction.add(web3.SystemProgram.transfer({
    fromPubkey: from.publicKey,
    toPubkey: to.publicKey,
    lamports: solToTransfer,
  }));

  const instruction = new web3.TransactionInstruction(
    {
       keys: [],
       programId: new web3.PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),
       data: Buffer.from(memoString)
     });
  let signature=await web3.sendAndConfirmTransaction(makeSolConnection(), transaction.add(instruction), [from]);
  let response=await connection.getConfirmedTransaction(signature);
    let responseObj={
        transact_signature:signature,
        transact_response:response
    }
    return responseObj;
};

// memo transaction sol
module.exports.memoTransaction = async (fromPublicKey, toPublicKey, memoObj) =>
{
  let connection =  makeSolConnection();
  let transaction = new web3.Transaction();
  let memoString=buildmemostring(memoObj);

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
function buildmemostring(metaObj) {
    let memoString = "memo_id:" + metaObj._id + ",\n";
    memoString += "lawyer_name:" + metaObj.lawyer_name + ",\n";
    memoString += "client_name:" + metaObj.client_name + ",\n";
    memoString += "lawyer_postal_code:" + metaObj.lawyer_postal_code + ",\n";
    memoString += "client_postal_code:" + metaObj.client_postal_code + ",\n";
    memoString += "type_of_doc:" + metaObj.type_of_doc + ",\n";
    memoString += "date_of_sign:" + metaObj.date_of_sign + ",\n";
    memoString += "mode_of_sign:" + metaObj.mode_of_sign + ",\n";
    memoString += "hash_of_file:" + metaObj.hash_of_file + ",\n";
    memoString += "file_id:" + metaObj.file_id + ",\n";
    memoString += "file_version:" + metaObj.file_version + ",\n";
    memoString += "executor_name:" + metaObj.executor_name + "\n";
    return memoString;
}

