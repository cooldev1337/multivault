const config = require("../config/config");
const fs = require("fs");
const path = require("path");
const { ethers } = require("ethers");

require("dotenv").config();

const { CdpClient } = require("@coinbase/cdp-sdk");

const cdp = new CdpClient();

// const artifact = JSON.parse(
//   fs.readFileSync(
//     path.join(__dirname, "..", "..", "contracts", "artifacts", "SimpleMultisig.json"),
//     "utf8"
//   )
// );

// const RPC_URL = process.env.RPC_URL;
// const DEPLOYER_KEY = process.env.DEPLOYER_KEY;

// async function deployMultisig(owners, threshold) {
//   if (!RPC_URL || !DEPLOYER_KEY)
//     throw new Error("RPC_URL or DEPLOYER_KEY missing");
//   const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
//   const wallet = new ethers.Wallet(DEPLOYER_KEY, provider);

//   const factory = new ethers.ContractFactory(
//     artifact.abi,
//     artifact.bytecode,
//     wallet
//   );
//   const contract = await factory.deploy(owners, threshold, {
//     gasLimit: 6_000_000,
//   });
//   await contract.deployed();
//   return contract.address;
// }

// module.exports = {
//   deployMultisig,
// };

exports.getorCreateWallet = async (id) => {
  // Create owner EOA
  const owner = await cdp.evm.getOrCreateAccount({
    name: `${id}-owner`,
  });

  // Create Smart Account (gasless)
  const smartAccount = await cdp.evm.getOrCreateSmartAccount({
    name: `${id}`,
    owner,
  });

  return {
    address: smartAccount.address,
    accountType: "smart-account",
    gasless: true,
  };
};

exports.listTokenBalances = async (userWallet) => {
  const result = await cdp.evm.listTokenBalances({
    address: userWallet.address,
    network: "base-sepolia",
  });
  return result;
};

exports.getBalanceinusdc = (userWallet) => {
  const USDC_NATIVE_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";

  const usdc = userWallet.balances.find(
    (b) => b.token.contractAddress === USDC_NATIVE_ADDRESS
  );

  let balanceInusdc = 0;

  if (usdc) {
    const raw = BigInt(USDC.amount.amount);
    const decimals = Number(USDC.amount.decimals);
    balanceInusdc = Number(raw) / 10 ** decimals;
  }
  return balanceInusdc;
};
