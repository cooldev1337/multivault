import db from "../db/index.js";
import { users } from "../db/schema.js";

export const getUser = async (userId) => {
  return await db.query.users.findFirst({
    where: (user, { eq }) => (eq(user.user, userId)),
  });
}

export const createUser = async (userId, chatId, walletAddress) => {
  const value = {
    user: userId.toString(),
    tgChatId: chatId.toString(),
    walletAddress: walletAddress,
  };

  return await db.insert(users).values(value).onConflictDoNothing().execute().returning();
}

export const getOrCreateUser = async (userId, chatId, walletAddress) => {
  const user = await db.query.users.findFirst({
    where: (user, { eq }) => (eq(user.user, userId)),
  });

  if (!user) {
    return createUser(userId, chatId, walletAddress);
  } else {
    return user;
  }
}

/*
export const encrypt = (theData) => {
  const cipherPassword = process.env.ENCRYPT_PASS;
  const iv = getRandomNumber(16);
  const cipher = crypto.createCipheriv("aes256", cipherPassword, iv);
  let encrypted = cipher.update(
    theData, 
    "utf8", 
    "base64"
  );
  encrypted += cipher.final("base64");
  return iv + iv + encrypted; // 2 times the iv for opaqueness
}

export const decrypt = (encryptedData) => {
  const cipherPassword = process.env.ENCRYPT_PASS;
  // Pull the iv and encrypted data (first 32 bytes is the iv)
  const iv = encryptedData.substr(0, 16);
 // const ivArray = hexStringToByteArray(iv);
  // create a decipher object to decrypt the data
  const decipher = crypto.createDecipheriv("aes256", cipherPassword, iv);
  // capture the rest of the string as our encrypted data
  const theData = encryptedData.substr(32);
  var decrypted = decipher.update(theData, "base64", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
*/