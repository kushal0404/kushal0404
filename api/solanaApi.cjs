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
    <input type="text" name="from_public_key" placeholder="Enter from public key"><br />\
    <input type="text" name="to_public_key" placeholder="Enter to public key"><br />\
    <input type="text" name="sol" placeholder="Enter SOL amount"><br />\
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

  let senderAccount=await db.find(df.TALBENAMES.ACCOUNT,{ public_key: fields["from_public_key"]});
  // login_token check
  // if(adminAccount.login_token != fields["login_token"]){
  //   res.send(df.rtnformat(400, "Login Token Error!", {}));
  //   res.end();
  //   return;
  // }

  let receiverAccount=await db.find(df.TALBENAMES.ACCOUNT,{ public_key: fields["to_public_key"]});
  // Lawyer account check
  // if(clientAccount == null || clientAccount.account_type != "L"){
  //   res.send(df.rtnformat(400, "It isn't exist Lawyer.", {}));
  //   res.end();
  //   return;
  // }

  // make sender keypair
  let senderKeypair=tools.getKeypairFromSecretKey(tools.decryptSecretKey(senderAccount.private_key));
  // make receiver keypair
  let receiverKeypair=tools.getKeypairFromSecretKey(tools.decryptSecretKey(receiverAccount.private_key));
  // set transfer SOL amount
  let solToTransfer=fields["sol"]*df.LAMPORTS_PER_SOL;

  // check sender wallet balance
  let existingBalance=await sol.checkAccountBalance(senderKeypair.publicKey);

  if(existingBalance>=solToTransfer+5000)
  {
    //for finding metadata
    let foundMeta=await db.find(df.TALBENAMES.META,{ lawyer_name: "Admin"});

    // SOl transfer
    let memo_response=await sol.transferSOL(senderKeypair,receiverKeypair,solToTransfer,foundMeta);

    //building a transaction object from the response
    let transactObj=format.transactionFormat(memo_response,solToTransfer);
    //Inserting transaction object into the transaction_data table
    await db.insertOne(df.TALBENAMES.TRANSACTION,transactObj);

    //getting sender balance
    let senderBalance=await sol.checkAccountBalance(senderKeypair.publicKey);
    // gettting receiver balance
    let receiverBalance=await sol.checkAccountBalance(receiverKeypair.publicKey);

    // update sol balance info on DB
    await db.updateOne(df.TALBENAMES.ACCOUNT,senderAccount,{ "wallet_balance": senderBalance });
    await db.updateOne(df.TALBENAMES.ACCOUNT,receiverAccount,{ "wallet_balance": receiverBalance });

    //await updateBalance(adminAccount);
    res.send(df.rtnformat(200, "Transfered", {"memo_response": memo_response}));
    res.end();
  }else
  {
    res.send(df.rtnformat(400, "Transaction Failed, due to insufficient balance !", {}));
    res.end();
  }
});

module.exports = router;