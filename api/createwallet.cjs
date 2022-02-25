const { Router } = require('express');
const {Keypair} = require("@solana/web3.js")
// Initialized router instance
const routerObj = new Router();
const bodyParser = require("body-parser");
var df = require('../config/define');
var tools = require('../common/tools');
const db = require('../common/db');
const sol = require('../common/sol');
const format = require('../config/format');
db.init();

routerObj.use(bodyParser.urlencoded({ extended: true }))

routerObj.post('/createwallet', async function(req, res)
{
    //creating the solana wallet from here
    let account= await sol.makeSolAccount();

    //checking the wallet balance from here
    let balance=await sol.checkAccountBalance(account.publicKey);

    //creating the account object to insert
    let accountObj=format.accountformat(req);
    accountObj.public_key=account.publicKey.toString();
    accountObj.private_key=tools.encryptSecretKey(account.secretKey);
    accountObj.wallet_balance=balance;

    //inserting user info into the account_data table
    let insertAccountObj=await insertAccount(accountObj);

    /* //for finding an account
    let query={ public_key: account.publicKey.toString()}
    let foundAccount=await findAccount(query);
    console.log(foundAccount.public_key); */

    res.send(df.rtnformat(200,  "Inserted Successfully", {"publickey":account.publicKey.toString()}));
    res.end();
});

async function insertAccount(insertAccountObj)
{
    return await db.insertOne(df.TALBENAMES.ACCOUNT,insertAccountObj);
}

async function findAccount(query)
{
    return await db.find(df.TALBENAMES.ACCOUNT,query);
}

async function getKeyPairFromSecretKey(secretKey)
{
    return Keypair.fromSecretKey(account.secretKey)
}

async function insertMeta(insertAccountObj)
{
    return await db.insertOne(df.TALBENAMES.ACCOUNT,insertAccountObj);
}

module.exports = routerObj;