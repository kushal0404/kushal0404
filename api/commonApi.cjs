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
 const { v4: uuidv4 } = require('uuid');
 var df = require('../config/define');
 const db = require('../common/db');
 const sol = require('../common/sol');
 const ObjectId = require('mongodb').ObjectID;
 
 
  // when sign in, get public key and update userToken for the cheking sign in on lagaci
 router.get('/updateUserToken', async function(req, res){
 

    var publicK = "publicKey";
    let loginToken = "";
    let userInfo = await db.find(df.TALBENAMES.ACCOUNT, {"publicKey":req.query.publicKey});
    console.log(userInfo);
    if(userInfo == null || userInfo.length != 1){
        
    }else{
        // update login token if it is exist user. 
        loginToken = uuidv4();
        userInfo[0].loginToken = loginToken;
        await db.updateOne(df.TALBENAMES.ACCOUNT, {"publicKey":req.query.publicKey}, userInfo[0]);
    }

    // console.log(await sol.makeSolAccount());
    // console.log(await sol.checkAccountBalance("A9ek8ozUxXopgoyyULH576dqxHX5vLtTDthzUjCFvPaF"));
    //const id = new Object("621d1d218ef5594f2cfc0a19");
    console.log(ObjectId("621d1d218ef5594f2cfc0a19"));
    console.log(await db.find(df.TALBENAMES.ACCOUNT, { _id: ObjectId("621d1d218ef5594f2cfc0a19")}));
    res.send(df.rtnformat(200,  "message field!!", {"loginToken":loginToken}));  
    res.end();
 
  });
 
 
 module.exports = router;