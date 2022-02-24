const {Buffer} = require('buffer');
const web3 = require("@solana/web3.js");
var df = require('../config/define');

function makeSolConnection(){
    return new web3.Connection(web3.clusterApiUrl(df.solConnection));
}

// create account on Solana
module.exports.makeSolAccount = async () => {
    try{
        let payer = web3.Keypair.generate();
        console.log(payer.publicKey.toBase58());
        await makeSolConnection();
        return payer;
    }catch(err){
        return err;
    }
};


// Check account balance on Solana
module.exports.checkAccountBalance = async (pk) => {
    try{
        return await makeSolConnection().getAccountInfo(new web3.PublicKey(pk));
    }catch(err){
        return err;
    }
};

