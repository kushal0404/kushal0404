/**
 * Created by Jakeom 
 * Description : File upload and download
 * 
 * Create Time : 16/02/2022
 * update Time : 25/02/2022
 */
const { Router } = require('express');
// Initialized router instance
const router = new Router();

var path = require('path');
var fs = require('fs');
const crypto = require('crypto');
const os = require('os');
const asyncBusboy  = require('async-busboy');
const { v4: uuidv4 } = require('uuid');
var tools = require('../common/tools');
var df = require('../config/define');
const db = require('../common/db');
const format = require('../config/format');
db.init();
//const ObjectId = require('mongodb').ObjectID;


router.get('/', async function(req, res){
  
    res.send('<html><head></head><body>\
      <form method="POST" enctype="multipart/form-data">\
      <input type="text" name="public_key" placeholder="input lawyer public key"><br />\
      <input type="text" name="version_number" placeholder="input version number"><br />\
      <input type="text" name="file_type" placeholder="input file_type (W or S)"><br />\
      <input type="file" name="filefield1" ><br />\
      <input type="file" name="filefield2" ><br />\
      <input type="submit" value="submit">\
      </form>\
      </body></html>');
    res.end();

 });

 // accept POST request on the homepage
 router.post('/',async function (req, res) {

  // return Data filed
  var rntData = [];

  // error message filed
  var error = "";

  // init make save folder
  const saveTo = path.join(df.fileSavePath);
    if (!fs.existsSync(saveTo)) {
      fs.mkdirSync(saveTo);
  }

  // get paramter and files
  const {files, fields} = await asyncBusboy(req); 

  // get user data on database using public key
  let userInfo =await db.find(df.TALBENAMES.ACCOUNT, {"public_key":fields["public_key"]});
  
  // get file information
  var tempFileData = [];
  files.forEach(file => {
      if(file.filename != null && file.filename.length > 0){
        var param = {"filename":file.filename,"mimetype":file.mimeType,"tempSaveTo":file.path};
        tempFileData.push(param);
      }
  });

  // It isn't exist Lawyer or No data
  if(userInfo == null || userInfo.account_type != "L"){
    error = "It isn't exist Lawyer.";
  // file check.
  }else if(tempFileData.length == 0){
    error = "It is required file.";
  // file type check.
  }else if(fields["file_type"].length == 0){
    error = "File Type is required.";
  // file version number
  }else if(fields["version_number"].length == 0){
    error = "Version Number is required.";
  }

  // return error when exist error 
  if(error != ""){
    res.send(df.rtnformat(500,  error, null));
  }else{
    // file save
    for (var i = 0; i < tempFileData.length; i++) {
        let tempData = tempFileData[i];
        let tempSaveTo = tempData.tempSaveTo;
        const fileBuffer = fs.readFileSync(tempSaveTo);
      
        // get file hash code
        const hashSum = crypto.createHash('sha256');
        hashSum.update(fileBuffer);
        fileHash = hashSum.digest('hex');

        var fileId = tools.makeEncryptedFile(tempSaveTo);
        // encrypted file save and add file info to MongoDB.
        // fileId , originFilename , fileType, fileHash;
        if(fileId != null){

          // get fiel create format
          var fileFormat = format.fileFormat();

          fileFormat.file_id = fileId;
          fileFormat.public_key = fields["public_key"];
          fileFormat.file_name = tempData.filename;
          fileFormat.mimetype =  tempData.mimetype; 
          fileFormat.file_type = fields["file_type"];
          fileFormat.version_number = fields["version_number"];
          fileFormat.file_hash = fileHash;
          rntData.push({file_id : fileId});

          // save file data on database
          db.insertOne(df.TALBENAMES.FILE, fileFormat);
        }
    }

    res.send(df.rtnformat(200,  "file upload Successfully", rntData));   
  }
  res.end();

});

router.get('/download', async function (req, res) {
  
  const result = await tools.getIpInfo();
  
    // ip address and Country Check using ipinfo result
    console.log(result);

    // User check using personal public key in MongoDB
    //let userInfo = await db.find(df.TALBENAMES.ACCOUNT, {"publicKey":req.query.publicKey});

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

  var bf = Buffer.from(fileResult, 'base64');
  res.writeHead(200, {
    "Content-Disposition": "attachment;filename="+ fileData.file_name,
    'Content-Type': fileData.mimetype,
    'Content-Length': bf.length
  });
  res.end(bf);

});


module.exports = router;