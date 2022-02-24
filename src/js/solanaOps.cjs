const web3 = require("@solana/web3.js");
const mongo = require("./mongo.cjs")

async function createAccount(){
  const from = web3.Keypair.generate();
  const publicKey = from.publicKey.toString();
  const secretKey = from.secretKey.toString();
  return { from, publicKey, secretKey };
}

// SOL TRANSFER FUNCTION (NOT USED IN THIS EXAMPLE)
async function transferOperation(toPubKey, from) {

/*
  mongo.getSecretKey("ktrivedi8967@conestogac.on.ca").then((private_key) => {
    from = private_key
  })
  */
  let seedTo = Uint8Array.from([248,166,245,250,171,49,69,81,233,61,
                              218,85,149,134,138,56,54,65,37,118,24,
                              39,53,78,136,91,61,225,208,191,52,169,
                              235,151,110,102,216,213,37,19,49,12,198,
                              34,5,112,49,33,120,213,20,225,28,172,57,
                              14,196,100,137,197,92,191,96,26])
  let to = web3.Keypair.fromSecretKey(seedTo);

  let seedFrom = Uint8Array.from([188,69,10,38,34,102,99,162,222,6,118,179,16,134,221,139,16,112,25,151,250,47,91,211,165,10,30,45,210,79,126,101,253,83,164,165,41,124,35,126,159,135,88,18,66,20,238,239,107,97,223,45,61,49,102,80,152,196,209,155,5,57,32,133])
  let from = web3.Keypair.fromSecretKey(seedFrom);

  console.log(web3.clusterApiUrl('devnet'))
  const connection = new web3.Connection(
    web3.clusterApiUrl('devnet'),
    'confirmed',
  );

  fromPubKey = from.publicKey
  toPubKey = to.publicKey


  // Add transfer instruction to transaction
  const transaction = new web3.Transaction().add(
    web3.SystemProgram.transfer({
      fromPubkey: fromPubKey,
      toPubkey: toPubKey,
      lamports: web3.LAMPORTS_PER_SOL / 100,
    })
  );

  // Sign transaction, broadcast, and confirm
  const transferSignature = await web3.sendAndConfirmTransaction(
    connection,
    transaction,
    [from]
  );
  return { transferSignature };
}

module.exports = {
  transferOperation: transferOperation
}
