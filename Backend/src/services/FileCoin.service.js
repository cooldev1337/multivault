import { Synapse, RPC_URLS, TOKENS, TIME_CONSTANTS } from "@filoz/synapse-sdk"
import { ethers } from "ethers"
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const config = require("../config/config.js");


async function buystorage() {
  try {
     // 1) Initialize the Synapse SDK
  const synapse = await Synapse.create({
    privateKey: process.env.FileCoinKey,
    rpcURL: RPC_URLS.calibration.http,
  })
  console.log("entro al buy storage ");
    // 2) Fund & approve (single tx)
  const depositAmount = ethers.parseUnits("2.5", 18)
  const tx = await synapse.payments.depositWithPermitAndApproveOperator(
    depositAmount, // 2.5 USDFC (covers 1TiB of storage for 30 days)
    synapse.getWarmStorageAddress(),
    ethers.MaxUint256,
    ethers.MaxUint256,
    TIME_CONSTANTS.EPOCHS_PER_MONTH,
  )
  await tx.wait()
  return tx;
  } catch (error) {
    return error;
  }
 
}

async function uploadstorage(data) {
  try {
        const synapse = await Synapse.create({
    privateKey: process.env.FileCoinKey,
    rpcURL: RPC_URLS.calibration.http,
  })
    console.log("entro al upload ");

const data2 = new TextEncoder().encode(data);
  const { pieceCid, size } = await synapse.storage.upload(data2)
  console.log(`PieceCID: ${pieceCid}`);
  console.log(`Size: ${size} bytes`);

  return {pieceCid,size};
  } catch (error) {
    return error;
  }

}

async function downloadstorage(pieceCid) {
try {
      const synapse = await Synapse.create({
    privateKey: process.env.FileCoinKey,
    rpcURL: RPC_URLS.calibration.http,
  })
  // 4) Download
  const bytes = await synapse.storage.download(pieceCid)
  const decodedText = new TextDecoder().decode(bytes);
return decodedText
} catch (error) {
  return error;
}

}

export const buy = () => {
buystorage();
}


export const upload = (data) => {
try {
   const { pieceCid, size }= uploadstorage(data);
   return { pieceCid, size };
} catch (error) {

}
}

export const download = (data) => {

  try {
    return downloadstorage(data);
  } catch (error) {
      return error;
  }

}

