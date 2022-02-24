const { MongoClient } = require('mongodb');

const uri = "mongodb://conestoga:Testing123@3.98.221.213:27017/sample-db";
const dbName = "sample-db";

const client = new MongoClient(uri);

client.connect();

const db = client.db(dbName);
const collection = db.collection('account_data');
const meta_collection = db.collection('metadata');

const insertAccount = async (obj) => {
  return new Promise(async (resolve, reject) => {
    const insertResult = await collection.insertOne(obj, function (err, res) {
      if (err) {
        throw err;
        reject("Document didn't insert")
      }

      console.log("ObjectId: "+ res.insertedId);
      resolve(res);
    });
  })
};

const findAccount = (query) => {
  return new Promise(async (resolve, reject) => {
  const result = await collection.findOne(query);
  resolve(result);
  })
}

const modifyRecord = async (user_id, newRecord) => {
  var qry = { "user_id": user_id };
  var newValues = {$set: { newRecord }};

  collection.updateOne(qry, newValues, function(err, res) {
    if (err) throw err;
    console.log("1 document updated");
  });
};

const insertMetadata = async (obj) => {
  return new Promise(async (resolve, reject) => {
    const insertResult = await meta_collection.insertOne(obj, function (err, res) {
      if (err) {
        throw err;
        reject("Document didn't insert")
      }

      console.log("ObjectId: "+ res.insertedId);
      resolve(res);
    });
  })
};

const findMetaData = (query) => {
  return new Promise(async (resolve, reject) => {
  const result = await meta_collection.findOne(query);
  resolve(result);
  })
}


module.exports = {
  insertAccount: insertAccount,
  modifyRecord: modifyRecord,
  findAccount: findAccount,
  insertMetadata: insertMetadata,
  findMetaData:findMetaData
}
