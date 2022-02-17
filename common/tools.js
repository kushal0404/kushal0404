/**
 * Created by Jakeom 
 * Description : File upload and download
 * 
 * Create Time : 16/02/2022
 * update Time : 16/02/2022 Updated by Jakeom 
 */
var crypto = require('crypto');
var path = require('path');
var fs = require('fs');
const ipInfo = require("ipinfo")
const archiver = require('archiver');
const { v4: uuidv4 } = require('uuid');
var df = require('../config/define');
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
    }
};


