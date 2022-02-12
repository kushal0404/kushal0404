const web3 =  require("@solana/web3.js");
const  MongoClient  = require('mongodb');

console.log("0-------------------")
	const uri = "mongodb+srv://guru:AEZAKMI%40010@inheritchaintest.g1chj.mongodb.net/test";
  const client = new MongoClient(uri);
  
  
  try 
  {
    console.log("1-------------------")
    await client.connect();
    const dbname = "sample-db";
    const db = client.db(dbName);
    const collection = client.collection('solana-data');
    await listDatabases(client);
    
  } 
  catch (e) 
  {
    console.error(e);
  }
  finally 
  {
    await client.close();
  }



async function listDatabases(client)
{
  console.log("2-------------------")
    databasesList = await client.db().admin().listDatabases();
 
    console.log("Databases:");
    databasesList.databases.forEach(db => console.log(` - ${db.name}`));
};


let firstPublicKey,secondPublicKey,firstSecretKey,airDropSignature,transferSignature;

(async () => {
  // Connect to cluster
  console.log(web3.clusterApiUrl('devnet'))
  const connection = new web3.Connection(
    web3.clusterApiUrl('devnet'),
    'confirmed',
  );
  // Uncomment the below command to test your connection to your node
  //console.log(await connection.getEpochInfo())

  // Generate a new random public key
  const from = web3.Keypair.generate();
  firstPublicKey=from.publicKey.toString();
  firstSecretKey=from.secretKey.toString();
  airDropSignature = await connection.requestAirdrop(
    from.publicKey,
    web3.LAMPORTS_PER_SOL,
  );
  await connection.confirmTransaction(airDropSignature);
  // Generate a new random public key
  const to = web3.Keypair.generate();
  secondPublicKey=to.publicKey.toString();
  // Add transfer instruction to transaction
  const transaction = new web3.Transaction().add(
    web3.SystemProgram.transfer({
      fromPubkey: from.publicKey,
      toPubkey: to.publicKey,
      lamports: web3.LAMPORTS_PER_SOL / 100,
    }),
  );

  // Sign transaction, broadcast, and confirm
  transferSignature = await web3.sendAndConfirmTransaction(
    connection,
    transaction,
    [from],
  );
  console.log('First public key', firstPublicKey);
  console.log('First secret key', firstSecretKey);
  console.log('Air Drop SIGNATURE', airDropSignature);
  console.log('SIGNATURE', transferSignature);

  
})();
