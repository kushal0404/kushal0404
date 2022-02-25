const {Buffer} = require('buffer');
const web3 = require("@solana/web3.js");
var df = require('../config/define');

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

// create account on Solana
module.exports.transferSOL = async (fromPubkey,toPublicKey) =>
{
    try
    {
        //logic
        return payer;
    }catch(err){
        return err;
    }
};