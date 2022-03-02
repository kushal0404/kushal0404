const { Router } = require('express');
const {Keypair} = require("@solana/web3.js")
// Initialized router instance
const routerObj = new Router();
const asyncBusboy  = require('async-busboy');
var df = require('../config/define');
var tools = require('../common/tools');
const db = require('../common/db');
const sol = require('../common/sol');
const format = require('../config/format');


routerObj.get('/createwallet', async function(req, res)
{
    res.send('<html><head></head><body>\
        <h3>Create Wallet</h3>\
        <form method="POST" enctype="multipart/form-data">\
        <input type="text" class="form-control" name="name" id="name" placeholder="input Name"><br />\
        <input type="text" class="form-control" name="surname" id="surname" placeholder="input surname"><br />\
        <input type="email" class="form-control" name="email" id="email" placeholder="input email"><br />\
        <input type="radio" name="acc_type" value="C" id="client">Clien\
        <input type="radio" name="acc_type" value="L" id="lawyer">Lawyer<br />\
        <input type="submit" value="submit">\
        </form>\
        </body></html>');
    res.end();
});

routerObj.post('/createwallet', async function(req, res)
{
    //creating the solana wallet from here
    let account= await sol.makeSolAccount();

    // get paramter and files
    const {files, fields} = await asyncBusboy(req); 

    //checking the wallet balance from here
    let balance=await sol.checkAccountBalance(account.publicKey);

    //creating the account object to insert
    let accountObj=format.accountformat(fields);
    accountObj.user_id=await db.getValueForNextSequence(df.TALBENAMES.ACCOUNT_SEQ);
    accountObj.public_key=account.publicKey.toString();
    accountObj.private_key=tools.encryptSecretKey(account.secretKey);
    accountObj.wallet_balance=balance;

    //inserting user info into the account_data table
    await db.insertOne(df.TALBENAMES.ACCOUNT,accountObj);

    res.send(df.rtnformat(200,  "Inserted Successfully", {"publickey":account.publicKey.toString()}));
    res.end();
});

module.exports = routerObj;
