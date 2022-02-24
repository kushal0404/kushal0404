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
 db.init();
 
 
  // when sign in, get public key and update userToken for the cheking sign in on lagaci
 router.get('/updateUserToken', async function(req, res){
 
    let loginToken = "";
    let userInfo = await db.find(df.TALBENAMES.ACCOUNT, {"publicKey":req.query.publicKey});

    if(userInfo == null || userInfo.length != 1){
        
    }else{
        // update login token if it is exist user. 
        loginToken = uuidv4();
        userInfo[0].loginToken = loginToken;
        await db.updateOne(df.TALBENAMES.ACCOUNT, {"publicKey":req.query.publicKey}, userInfo[0]);
    }

    console.log(await sol.makeSolAccount());
    console.log(await sol.checkAccountBalance("A9ek8ozUxXopgoyyULH576dqxHX5vLtTDthzUjCFvPaF"));
    console.log("sddasd");

     res.send(df.rtnformat(200,  "message field!!", {"loginToken":loginToken}));  
     res.end();
 
  });
 
 
 module.exports = router;