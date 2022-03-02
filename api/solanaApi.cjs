const { Router } = require('express');
// Initialized router instance
const router = new Router();
const asyncBusboy  = require('async-busboy');
var tools = require('../common/tools');
var df = require('../config/define');
const db = require('../common/db');
const sol = require('../common/sol');
const format = require('../config/format');

//routerObj.use(bodyParser.urlencoded({ extended: true }));

router.get('/transfer', async function(req, res){
  
  res.send('<html><head></head><body>\
    <h3>Transfer Sol</h3>\
    <form method="POST" enctype="multipart/form-data">\
    <input type="text" name="login_token" placeholder="input login token"><br />\
    <input type="text" name="public_key" placeholder="input lawyer public key"><br />\
    <input type="text" name="sol" placeholder="input SOL amount"><br />\
    <input type="submit" value="submit">\
    </form>\
    </body></html>');
  res.end();

});

router.post('/transfer', async function(req, res)
{

  // get paramter and files
  const {files, fields} = await asyncBusboy(req); 

  //for finding an account
  
  let adminAccount=await db.find(df.TALBENAMES.ACCOUNT,{ account_type: "A"});
  // login_token check
  // if(adminAccount.login_token != fields["login_token"]){
  //   res.send(df.rtnformat(400, "Login Token Error!", {}));
  //   res.end();
  //   return;
  // }

  let clientAccount=await db.find(df.TALBENAMES.ACCOUNT,{ public_key: fields["public_key"]});
  // Lawyer account check
  // if(clientAccount == null || clientAccount.account_type != "L"){
  //   res.send(df.rtnformat(400, "It isn't exist Lawyer.", {}));
  //   res.end();
  //   return;
  // }

  // make admin key fair
  let adminKeypair=tools.getKeypairFromSecretKey(tools.decryptSecretKey(adminAccount.private_key));
  // make lawyer key fair
  let clientKeypair=tools.getKeypairFromSecretKey(tools.decryptSecretKey(clientAccount.private_key));
  // set transfer SOL amount
  let solToTransfer=1*df.LAMPORTS_PER_SOL;

  // check admin Sol balance
  let existingBalance=await sol.checkAccountBalance(adminKeypair.publicKey);
  
  
  if(existingBalance>=solToTransfer)
  {
    // SOl transfer
    let signature=await sol.transferSOL(adminKeypair,clientKeypair,solToTransfer);
    console.log("Signature"+signature);
    // get transacntion info 
    // 
    // insert transaction data on DB
    //

    // get admin sol balance 
    let adminBalance=await sol.checkAccountBalance(adminKeypair.publicKey);
    // get lawyer sol balance 
    let lawyerBalance=await sol.checkAccountBalance(clientKeypair.publicKey);

    // update sol balance info on DB
    await db.updateOne(df.TALBENAMES.ACCOUNT,adminAccount,{ "wallet_balance": adminBalance });
    await db.updateOne(df.TALBENAMES.ACCOUNT,clientAccount,{ "wallet_balance": lawyerBalance });


    //await updateBalance(adminAccount);
    res.send(df.rtnformat(200, "Transfered", {"signature": signature}));
    res.end();
  }else
  {
    res.send(df.rtnformat(400, "Transaction Failed !", {}));
    res.end();
  }
});

module.exports = router;