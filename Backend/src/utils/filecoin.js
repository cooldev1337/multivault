import { Synapse, RPC_URLS } from "@filoz/synapse-sdk";

export async function uploadTxtToStorage(data) {
  try {
    const synapse = await Synapse.create({
      privateKey: process.env.FileCoinKey,
      rpcURL: RPC_URLS.calibration.http,
    });

    const encodedDAta = new TextEncoder().encode(data);
    // const { pieceCid, size } 
    console.log("before synapse upload", encodedDAta)
    const uploadResult = await synapse.storage.upload(encodedDAta)
    console.log(`PieceCID: ${uploadResult.pieceCid}`);
    console.log(`Size: ${uploadResult.size} bytes`);

    return uploadResult;
  } catch (error) {
    return console.error("uploadToStorage error:", error);
  }
}

export async function downloadFromStorage(pieceCid) {
  try {
    const synapse = await Synapse.create({
      privateKey: process.env.FileCoinKey,
      rpcURL: RPC_URLS.calibration.http,
    });

    const bytes = await synapse.storage.download(pieceCid)
    const decodedText = new TextDecoder().decode(bytes);
    return decodedText
  } catch (error) {
    return error;
  }
}
