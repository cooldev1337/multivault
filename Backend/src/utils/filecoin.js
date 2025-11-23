import { Synapse, RPC_URLS } from "@filoz/synapse-sdk";

export async function uploadToStorage(data) {
  try {
    const synapse = await Synapse.create({
      privateKey: process.env.FileCoinKey,
      rpcURL: RPC_URLS.calibration.http,
    })

    const data2 = new TextEncoder().encode(data);
    // const { pieceCid, size } 
    const uploadResult = await synapse.storage.upload(data2)
    console.log(`PieceCID: ${uploadResult.pieceCid}`);
    console.log(`Size: ${uploadResult.size} bytes`);

    return uploadResult;
  } catch (error) {
    return console.error("uploadToStorage error:", error);
  }

}