const { Router } = require('express');
const routerObj = new Router();
const sol = require("../common/sol.js")
const db = require('../common/db');
const df = require("../config/define.js")
var tools = require('../common/tools');
const bodyParser = require("body-parser");

routerObj.use(bodyParser.urlencoded({ extended: true }));

routerObj.get('/transfer', async function(req, res)
{
  //for finding an account
  let query={ account_type: "A"}
  let adminAccount=await db.find(df.TALBENAMES.ACCOUNT,query);

  let query1={ account_type: "C"}
  let clientAccount=await db.find(df.TALBENAMES.ACCOUNT,query1);

  let adminKeypair=tools.getKeypairFromSecretKey(tools.decryptSecretKey(adminAccount.private_key));
  let clientKeypair=tools.getKeypairFromSecretKey(tools.decryptSecretKey(clientAccount.private_key));
  let solToTransfer=1*df.LAMPORTS_PER_SOL;

  let existingBalance=await sol.checkAccountBalance(adminKeypair.publicKey);
  console.log(existingBalance);
  if(existingBalance>=solToTransfer)
  {
    let signature=await sol.transferSOL(adminKeypair,clientKeypair,solToTransfer);
    console.log("Signature"+signature);
    let updatedBalance=await sol.checkAccountBalance(adminKeypair.publicKey);
    await db.updateOne(df.TALBENAMES.ACCOUNT,adminAccount,{ "wallet_balance": updatedBalance })
    //await updateBalance(adminAccount);
    res.send(df.rtnformat(200, "Transfered", {"signature": signature}));
    res.end();
  }else
  {
    res.send(df.rtnformat(400, "Transaction Failed !", {}));
    res.end();
  }
});

module.exports = routerObj;

async function updateBalance(adminAccount) {
  await db.collection(df.TALBENAMES.ACCOUNT).updateOne(
    { "public_key": adminAccount.public_key },
    { $set: { "wallet_balance": adminAccount.wallet_balance - 1 * df.LAMPORTS_PER_SOL } });
}

