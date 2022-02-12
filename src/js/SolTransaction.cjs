const web3 = require("@solana/web3.js");
const {Keypair, Transaction, LAMPORTS_PER_SOL, sendAndConfirmTransaction, clusterApiUrl} = require("@solana/web3.js");

const keys=Keypair.generate();
console.log("Pubkey:"+keys.publicKey.toString());
console.log("Secret Key:"+keys.secretKey)

let secArray=[];
let originalsecretKey=keys.secretKey;
Uint8Array.from(originalsecretKey,(element,index)=>
{
    secArray.push(element);
},this);
console.log(secArray) 

// my secret key...
let secretKey = Uint8Array.from(secArray); // my secret key...
let secKey  = Keypair.fromSecretKey(secretKey);
console.log(secKey);
/* let transaction = new Transaction();

transaction.add(
  SystemProgram.transfer({
    fromPubkey: fromKeypair.publicKey,
    toPubkey: toKeypair.publicKey,
    lamports: 10000000
  })
); */

let connection = new web3.Connection(clusterApiUrl('devnet'));

const signature=await connection.requestAirdrop(
    keys.publicKey,   
    web3.LAMPORTS_PER_SOL
);
await connection.confirmTransaction(signature);
console.log(signature);
/* sendAndConfirmTransaction(
  connection,
  transaction,
  [fromKeypair]
); */