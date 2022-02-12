const {Buffer} = require('buffer');
const web3 = require("@solana/web3.js");
const { connect } = require('http2');
(async () => {
    let keypair = web3.Keypair.generate();
    let payer = web3.Keypair.generate();
    console.log(keypair.publicKey.toBase58());
    console.log(payer.publicKey.toBase58());
    let connection = new web3.Connection(web3.clusterApiUrl('devnet'));
    let airdropSignature = await connection.requestAirdrop(
    payer.publicKey,
    web3.LAMPORTS_PER_SOL,
    );
    await connection.confirmTransaction(airdropSignature);
    const instruction = new web3.TransactionInstruction(
         {
            keys: [],
            programId: new web3.PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),
            /* data: Buffer.from("id=19,name=Kushal,surname=Trivedi") */
            data: Buffer.from("ABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRS")
          }
    );

  let trid = await web3.sendAndConfirmTransaction(connection, new web3.Transaction().add(instruction), [payer]);
  let signature = await connection.getConfirmedTransaction(trid);
  console.log(signature.transaction.instructions[0].data.toString());
})();