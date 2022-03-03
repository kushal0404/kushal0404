/**
 * Created by Jakeom
 * Description : DB connection
 *
 * Create Time : 16/02/2022
 * update Time : 02/03/2022 by Jakeom
 */
const MongoClinet = require('mongodb').MongoClient;
const df = require('../config/define');
let client;
let db;

/**
 * Connection of MongoDB
 */
if(client == null) {
    client = new MongoClinet(df.DBURL, {useNewUrlParser: true});

    try{
        client.connect();
        console.log("connected to MongoDB");

        db = client.db(df.DBNAME);

    }catch(err){
        console.log(err.stack);
    }
}

/**
 * Create new entry on MongoDB
 * @param {string} table name
 * @param {object} query
 * @returns {object}
 */
module.exports.insertOne = async (collection, object) => {
    return await db.collection(collection).insertOne(object);
};

/**
 * Updates entry on MongoDB
 * @param {string} table name
 * @param {object} query
 * @param {object} change object
 * @returns {object}
 */
module.exports.updateOne = async (collection, object, change) => {
    return await db.collection(collection).updateOne(object, {$set : change});
};

/**
 * Remove entry on MongoDB
 * @param {string} table name
 * @param {object} query
 * @returns {object}
 */
module.exports.deleteOne = async (collection, object) => {
    return await db.collection(collection).deleteOne(object);
};

/**
 * Get first matching entry on MongoDB
 * @param {string} table name
 * @param {object} query
 * @returns {object}
 */
module.exports.find = async (collection, query) =>
{
    return await db.collection(collection).findOne(query);
};

/**
 * Get Table Sequence on MongoDB
 * @param {string} table name
 * @param {string} target table name
 * @returns {object}
 */
module.exports.getValueForNextSequence = async (collection, query) =>
{
    let obj=await db.collection(collection).findOne();
    await db.collection(collection).updateOne(
        {"seq":obj.seq},
        {$set: { "seq" : obj.seq+1}})
    return obj.seq;
  }

/**
 * Get private key on MongoDB
 * @param {string} table name
 * @param {string} public key
 * @returns {object}
 */
module.exports.getSecretKey = async (collection, pubkey) => {
  var qry = {"public_key": pubkey};
  const projection = {"projection": {"private_key": 1}}
  return await db.collection(collection).findOne(qry, projection);
};
