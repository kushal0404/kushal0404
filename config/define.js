const { LAMPORTS_PER_SOL } = require("@solana/web3.js");

module.exports = {
    ISTEST: true,
    DBURL : process.env.MONGODB_URL,
    DBNAME : process.env.DBNAME,
    TALBENAMES : {ACCOUNT:"account_data",ACCOUNT_SEQ:"account_data_seq",SEQ:"seq_data",FILE:"file_data",META:"meta_data",META_SEQ:"meta_data_seq",TRANSACTION:"transaction_data",TRANSACTION_SEQ:"transaction_data_seq"},
    HEX : 'hex',
    UTF8 : 'utf8',
    BASE64 : 'base64',
    fileEnalgo: 'aes-256-cbc',
    mainEnKey: Buffer.from(process.env.MAINENKEY, "hex"),
    mainEnIv: Buffer.from(process.env.MAINENIV, "hex"),
    secretKey : process.env.SECRETKEY,
    fileSavePath : './upload',
    solConnection :  process.env.SECRETKEY, //"mainnet-beta",
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

