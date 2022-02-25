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
    accountObj.user_id=await db.getValueForNextSequence(df.TALBENAMES.ACCOUNT_SEQ);
    accountObj.public_key=account.publicKey.toString();
    accountObj.private_key=tools.encryptSecretKey(account.secretKey);
    accountObj.wallet_balance=balance;

    //inserting user info into the account_data table
    let insertAccountObj=await insert(df.TALBENAMES.ACCOUNT,accountObj);

    /* //for finding an account
    let query={ public_key: account.publicKey.toString()}
    let foundAccount=await find(df.TALBENAMES.ACCOUNT,query);
    console.log(foundAccount.public_key); */

    /* //inserting metadata
    let metaparams={
        lawyer_name:"Kushal",
        client_name:"Gurjyot"
    }
    let metaObj=format.metaformat(metaparams);
    metaObj.meta_data_id=await db.getValueForNextSequence(df.TALBENAMES.META_SEQ);
    let insertmetaObj=await insert(df.TALBENAMES.META,metaObj); */

    /* //for finding metadata
    let query1={ meta_data_id: 1}
    let foundMeta=await find(df.TALBENAMES.META,query1);
    console.log(foundMeta.client_name); */

    /* //inserting transactions
    let transactionParams={
        transaction_status:"success",
        confirmation_status:"success"
    }
    let transactObj=format.transactionFormat(transactionParams);
    transactObj.transaction_id=await db.getValueForNextSequence(df.TALBENAMES.TRANSACTION_SEQ);
    let insertTransactObj=await insert(df.TALBENAMES.TRANSACTION,transactObj); */

    /* //for finding transaction
    let query2={
                transaction_id:1,
                transaction_status: "success",
                confirmation_status:"success"
            }
    let foundtransaction=await find(df.TALBENAMES.TRANSACTION,query2);
    console.log(foundtransaction.transaction_id); */

    res.send(df.rtnformat(200,  "Inserted Successfully", {"publickey":account.publicKey.toString()}));
    res.end();
});

async function insert(collectionName,collectionObj)
{
    return await db.insertOne(collectionName,collectionObj);
}

async function find(collectionName,query)
{
    return await db.find(collectionName,query);
}

async function getKeyPairFromSecretKey(secretKey)
{
    return Keypair.fromSecretKey(account.secretKey)
}

module.exports = routerObj;