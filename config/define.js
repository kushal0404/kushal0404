module.exports = {
    DBURL : "mongodb+srv://admin:admin@cluster0.fozkz.mongodb.net/Inherit?retryWrites=true&w=majority",
    DBNAME : "Inherit",
    TALBENAMES : {ACCOUNT:"account",FILE:"file"},
    HEX : 'hex',
    UTF8 : 'utf8',
    BASE64 : 'base64',
    fileEnalgo: 'aes-256-cbc',
    mainEnKey: Buffer.from('f90dd01abd8add4579153be0a2f6cd2c3884072b7ce746abdfbaff4a5b129e17', "hex"),
    mainEnIv: Buffer.from('9b4636b67128599ff8b425006d048c52', "hex"),
    fileSavePath : './upload'

};

