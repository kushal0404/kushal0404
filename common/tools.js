/**
 * Created by Jakeom
 * Description : File upload and download
 *
 * Create Time : 16/02/2022
 * update Time : 16/02/2022 Updated by Jakeom
 */
var crypto = require('crypto');
var path = require('path');
const bs58 = require('bs58');
var fs = require('fs');
const ipInfo = require("ipinfo")
const archiver = require('archiver');
const { v4: uuidv4 } = require('uuid');
var df = require('../config/define');
const algorithm = 'aes-256-ctr';
const {Keypair} = require("@solana/web3.js")
const iv = crypto.randomBytes(16);
const LAMPORTS_PER_SOL=1000000000;
module.exports = {

    /**
     * @param {text} base64 text
     * @returns {String} Encrypted File text
     */
    encrypt :function (text) {

        // Creating Cipheriv with its parameter
        let cipher = crypto.createCipheriv(
        df.fileEnalgo, Buffer.from(df.mainEnKey), df.mainEnIv);

        // Updating text
        let encrypted = cipher.update(text);

        // Using concatenation
        encrypted = Buffer.concat([encrypted, cipher.final()]);

        // Returning iv and encrypted data
        return encrypted.toString(df.HEX);
    },

    /**
     * @param {text} base64 text
     * @returns {String} Edcrypted File text
     */
    decrypt : function (text) {
        let encryptedText = Buffer.from(text, df.HEX);

        // Creating Decipher
        let decipher = crypto.createDecipheriv(
        df.fileEnalgo, Buffer.from(df.mainEnKey), df.mainEnIv);

        // Updating encrypted text
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);

        // returns data after decryption
        return decrypted.toString();
    },

    /**
     * @param {tempSaveTo} saved temporary file path
     * @returns {String} file Id
     */
    makeEncryptedFile : function (tempSaveTo){
        var fileId = null;

        if(fs.readFileSync(tempSaveTo).length != 0){
            // file to base64 string
            const contents = fs.readFileSync(tempSaveTo, {encoding: df.BASE64});

            // encryted text
            var output = this.encrypt(contents);

            // make real file path
            fileId = uuidv4();
            const saveTo = path.join(df.fileSavePath, fileId);
            console.log(saveTo);
            // make encryted file
            fs.writeFileSync(saveTo, output, function(err) {});
        }
        // remove Temporary File
        fs.unlinkSync(tempSaveTo,function(err){
        if(err) return console.log(err);});

        return fileId;
    },

    /**
     * @param {saveTo} saved file path
     * @returns {String} encrypted file
     */
    makeEdcryptedFile : function (saveTo){
        //console.log('File decrypt start');
        var enFile = fs.readFileSync(saveTo,{encoding: df.UTF8});
        output = this.decrypt(enFile);
        //console.log('File decrypt');
        //let updateFinal = output.split(';base64,').pop();
        //fs.writeFileSync(outputFilename, updateFinal, {encoding: 'base64'}, function(err) {});

        return output;
    },

    /**
     * @param {String} sourceDir: /tmp/
     * @param {String} outPath: /save/{filename}.zip
     * @returns {Promise}
     */
    zipDirectory :function (sourceDir, outPath){
        const archive = archiver('zip', { zlib: { level: 9 }});
        const stream = fs.createWriteStream(outPath);

        return new Promise((resolve, reject) => {
          archive
            .directory(sourceDir, false)
            .on('error', err => reject(err))
            .pipe(stream)
          ;

          stream.on('close', () => resolve());
          archive.finalize();
        });
    },

    /**
     * Get IpInformation
     * @returns {Promise}
     */
     getIpInfo :function (){
        return new Promise((resolve, reject) => {
            ipInfo((err, cLoc) => {
                if(err != null){
                    reject(err);
                }else{
                    resolve(cLoc);
                }
            });
        });
    },
    encryptSecretKey :function (secretKey)
    {
        let seckey_base = bs58.encode(secretKey);
        const cipher = crypto.createCipheriv(algorithm, df.secretKey, iv);
        const encrypted = Buffer.concat([cipher.update(seckey_base), cipher.final()]);
        return {
            iv: iv.toString('hex'),
            content: encrypted.toString('hex')
        };
    },
    decryptSecretKey :function (hash)
    {
        const decipher = crypto.createDecipheriv(algorithm, df.secretKey, Buffer.from(hash.iv, 'hex'));
        const decrpyted = Buffer.concat([decipher.update(Buffer.from(hash.content, 'hex')), decipher.final()]);
        return decrpyted.toString();
    },
    getKeypairFromSecretKey:function (secretKey)
    {
        let dec_seckey_hex = bs58.decode(secretKey).toString('hex');
        const fromHexString = dec_seckey_hex => new Uint8Array(dec_seckey_hex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
        let sec_key_array = fromHexString(dec_seckey_hex);
        let keypair=Keypair.fromSecretKey(sec_key_array);
        return keypair;
    }
};
