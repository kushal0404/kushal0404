const { MongoClient } = require('mongodb');

const uri = "mongodb://conestoga:Testing123@3.98.221.213/sample-db";

const client = new MongoClient(uri);

client.connect();

const dbName = "sample-db";
const db = client.db(dbName);
const collection = db.collection('solana-data');

const insertAccount = async (obj) => {
  const insertResult = await collection.insertOne(obj);
  console.log("\n1 Document Inserted.")
  return insertResult;
};

const findAccount = async (qry) => {
  const result = await collection.findOne(qry);
  console.log("\nDocument Found.")
  return result;
}

const modifyRecord = async (user_id, newRecord) => {
  var qry = { "user_id": user_id };
  var newValues = {$set: { newRecord }};

  collection.updateOne(qry, newValues, function(err, res) {
    if (err) throw err;
    console.log("1 document updated");
  });
};


module.exports = {
  insertAccount: insertAccount,
  modifyRecord: modifyRecord,
  findAccount: findAccount
}
