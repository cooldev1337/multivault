import { Synapse, RPC_URLS, TOKENS, TIME_CONSTANTS } from "@filoz/synapse-sdk"
import { ethers } from "ethers"
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const config = require("../config/config.js");


async function buystorage() {
  // 1) Initialize the Synapse SDK
  const synapse = await Synapse.create({
    privateKey: process.env.FileCoinKey,
    rpcURL: RPC_URLS.calibration.http,
  })

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
  console.log(`✅ USDFC deposit and Warm Storage service approval successful!`);
}

async function uploadstorage(data) {
    const synapse = await Synapse.create({
    privateKey: process.env.FileCoinKey,
    rpcURL: RPC_URLS.calibration.http,
  })
const data2 = new TextEncoder().encode(data);
  const { pieceCid, size } = await synapse.storage.upload(data2)

   {pieceCid,size};
}

async function downloadstorage(pieceCid) {
    const synapse = await Synapse.create({
    privateKey: process.env.FileCoinKey,
    rpcURL: RPC_URLS.calibration.http,
  })
  // 4) Download
  const bytes = await synapse.storage.download(pieceCid)
  const decodedText = new TextDecoder().decode(bytes);
return decodedText
}

buystorage().then(() => {
  console.log("✅ buystorage workflow completed successfully!");
}).catch((error) => {
  console.error("❌ Error occurred:");
  console.error(error.message); // Clear error description
  console.error(error.cause); // Underlying error if any
});

uploadstorage().then(() => {
  console.log("✅ uploadstorage workflow completed successfully!");
}).catch((error) => {
  console.error("❌ Error occurred:");
  console.error(error.message); // Clear error description
  console.error(error.cause); // Underlying error if any
});

downloadstorage().then(() => {
  console.log("✅ downloadstorage workflow completed successfully!");
}).catch((error) => {
  console.error("❌ Error occurred:");
  console.error(error.message); // Clear error description
  console.error(error.cause); // Underlying error if any
});


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
      return "error";
  }

}

