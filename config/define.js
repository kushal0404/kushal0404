const { LAMPORTS_PER_SOL } = require("@solana/web3.js");

module.exports = {
    DBURL : "mongodb://conestoga:Testing123@3.98.221.213:27017/?authSource=sample-db&readPreference=primaryPreferred&appname=MongoDB%20Compass&directConnection=true&ssl=false",
    DBNAME : "sample-db",
    TALBENAMES : {ACCOUNT:"account_data",ACCOUNT_SEQ:"account_data_seq",FILE:"file_data",META:"meta_data",META_SEQ:"meta_data_seq",TRANSACTION:"transaction_data",TRANSACTION_SEQ:"transaction_data_seq"},
    HEX : 'hex',
    UTF8 : 'utf8',
    BASE64 : 'base64',
    fileEnalgo: 'aes-256-cbc',
    mainEnKey: Buffer.from('f90dd01abd8add4579153be0a2f6cd2c3884072b7ce746abdfbaff4a5b129e17', "hex"),
    mainEnIv: Buffer.from('9b4636b67128599ff8b425006d048c52', "hex"),
    secretKey : 'vOVH6sdmpNWjRRIqCc7rdxs01lwHzkz9',
    fileSavePath : './upload',
    solConnection :  "devnet", //"mainnet-beta",
    LAMPORTS_PER_SOL:1000000000,
    RESPONSE_CODES : {200:"success"},
};

module.exports.rtnformat = (status, message, data) => {
    return {
        "status" : status,
        "message" : message,
        "data" : data
    };
}

module.exports.accountFormat = (account) => {
    console.log("account="+account);
    return {
        "publickey" : account.publickey,
    };
}

