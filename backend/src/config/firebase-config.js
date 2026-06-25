import admin from "firebase-admin";
import { readFile } from "fs/promises";

let serviceAccount = null;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } catch (err) {
    console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT environment variable:", err);
  }
}

if (!serviceAccount) {
  try {
    const fileUrl = new URL("./serviceAccountKey.json", import.meta.url);
    const fileContent = await readFile(fileUrl, "utf8");
    serviceAccount = JSON.parse(fileContent);
  } catch (err) {
    console.warn("⚠️ Firebase serviceAccountKey.json not found locally. Auth features may fail if FIREBASE_SERVICE_ACCOUNT env var is not set.");
  }
}

if (serviceAccount && !admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
} else if (!admin.apps.length) {
  console.warn("⚠️ Firebase Admin could not be initialized (no credentials available).");
}

export default admin;
