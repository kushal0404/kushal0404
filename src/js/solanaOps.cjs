const web3 = require("@solana/web3.js");
const mongo = require("./mongo.cjs");
const tools = require("../../common/tools.js");


async function createAccount() {
  const from = web3.Keypair.generate();
  const publicKey = from.publicKey.toString();
  const secretKey = from.secretKey.toString();
  return { from, publicKey, secretKey };
}


module.exports = {
  transferOperation: transferOperation
}
