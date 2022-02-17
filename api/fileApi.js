/**
 * Created by Jakeom 
 * Description : File upload and download
 * 
 * Create Time : 16/02/2022
 * update Time : 16/02/2022
 */
const { Router } = require('express');
// Initialized router instance
const router = new Router();

var path = require('path');
var fs = require('fs');
const crypto = require('crypto');
const os = require('os');
var Busboy = require('busboy');
const { v4: uuidv4 } = require('uuid');
var tools = require('../common/tools');
var df = require('../config/define');
const db = require('../common/db');
db.init();
//const ObjectId = require('mongodb').ObjectID;


router.get('/', async function(req, res){

  // DB SELECT SAMPLE
  let products = await db.find(df.TALBENAMES.ACCOUNT, null);
  //console.log(JSON.stringify(products));

    res.send('<html><head></head><body>\
      <form method="POST" enctype="multipart/form-data">\
      <input type="text" name="textfield"><br />\
      <input type="file" name="filefield1" ><br />\
      <input type="file" name="filefield2" ><br />\
      <input type="submit" value="submit">\
      </form>\
      </body></html>');
    res.end();

 });

 // accept POST request on the homepage
 router.post('/',async function (req, res) {
  
  var fields = {};
  var tempFileData = [];
   // Login Token check
  

   // balance check on Solana


   // file save  (limited 100Mb)
    var busboy = new Busboy({ headers: req.headers,limits: {fileSize: 100*1024*1024} });

    let tmpDir = os.tmpdir();

    busboy.on('field', function(fieldname, val) {
      fields[fieldname] = val;
    });

    busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
      let tempSaveTo = path.join(tmpDir, uuidv4());
      
      var param = {"filename":filename,"mimetype":mimetype,"tempSaveTo":tempSaveTo};
      tempFileData.push(param);
      originFilename = filename;
      fileType = mimetype;
      file.pipe(fs.createWriteStream(tempSaveTo));
    });

    busboy.on('finish', function() {
      console.log('Upload complete');
      console.log(JSON.stringify(fields));

      for (var i = 0; i < tempFileData.length; i++) {
          let tempData = tempFileData[i];

          let tempSaveTo = tempData.tempSaveTo;
          const fileBuffer = fs.readFileSync(tempSaveTo);
        
          const hashSum = crypto.createHash('sha256');
          hashSum.update(fileBuffer);
          fileHash = hashSum.digest('hex');

          var fileId = tools.makeEncryptedFile(tempSaveTo);
          // encrypted file save and add file info to MongoDB.
          // fileId , originFilename , fileType, fileHash;
          if(fileId != null){
            console.log(`fileId: ${fileId},originFilename: ${tempData.filename},fileType: ${tempData.mimetype},fileHash: ${fileHash} ,fileSize: ${fileBuffer.length} `);
            // insert Sample
            db.insertOne(df.TALBENAMES.FILE, {fileId: fileId,originFilename: tempData.filename,fileType: tempData.mimetype,fileHash: fileHash ,fileSize: fileBuffer.length});
          }
      }
      res.writeHead(200, { 'Connection': 'close' });
      res.end("Nomal End");
    });

    return req.pipe(busboy);

});

router.get('/download', async function (req, res) {
  
  const result = await tools.getIpInfo();
  
    // ip address and Country Check using ipinfo result
    console.log(result);

    // User check using personal public key in MongoDB
    

    // File_id check in MongoDB
    let fileData = await db.find(df.TALBENAMES.FILE, {fileId : req.query.fileId});
    console.log(fileData);

    // load File


  // check File Hash

  var fileResult = "";
  try {

    const saveTo = path.join(df.fileSavePath, req.query.fileId);

    fileResult = await tools.makeEdcryptedFile(saveTo);
    console.log(fileResult.length);
  } catch (error) {
    console.error(error);
    // expected output: ReferenceError: nonExistentFunction is not defined
    // Note - error messages will vary depending on browser
  }

  res.writeHead(200, {'Content-Type': 'text/html'});
  res.write('<html><body><img src="data:image/jpeg;base64,')
  res.write(fileResult);
  res.end('"/></body></html>');

});


module.exports = router;