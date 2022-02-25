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


const getSecretKey = async (pubkey) => {
  var qry = {"public_key": pubkey};
  const projection = {"projection": {"private_key": 1}}

  return new Promise(async (resolve, reject) => {
    const result = await collection.findOne(qry, projection);
    resolve(result)
  })
}

let seckey;

const obj = getSecretKey("6DCMeA5Dvxs9Wo4Jq4cDTNJsdLfEPKMdMBfYfuacda4p")
obj.then((res) => {
  let seckey = res.private_key
  console.log(seckey)
})
