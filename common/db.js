/**
 * Created by Jakeom
 * Description : DB connection
 *
 * Create Time : 16/02/2022
 * update Time : 16/02/2022
 */
const MongoClinet = require('mongodb').MongoClient;
const df = require('../config/define');
let client;
let db;

// Initialize Mongo Client
module.exports.init = async () => {
    client = new MongoClinet(df.DBURL, {useNewUrlParser: true});

    try{
        await client.connect();
        console.log("connected to MongoDB");

        db = client.db(df.DBNAME);

    }catch(err){
        console.log(err.stack);
    }
};

// Create new entry
module.exports.insertOne = async (collection, object) => {
    return await db.collection(collection).insertOne(object);
};

// Updates entry
module.exports.updateOne = async (collection, object, change) => {
    return await db.collection(collection).updateOne(object, {$set : change});
};

// Remove entry
module.exports.deleteOne = async (collection, object) => {
    return await db.collection(collection).deleteOne(object);
};

// Get all entries
module.exports.find = async (collection, query) =>
{
    return await db.collection(collection).findOne(query);
};

module.exports.getValueForNextSequence = async (collection) =>
{
    let obj=await db.collection(collection).findOne();
    await db.collection(collection).updateOne(
        {"seq":obj.seq},
        {$set: { "seq" : obj.seq+1}})
    return obj.seq;
};
