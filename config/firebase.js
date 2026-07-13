const { initializeApp, cert, getApps } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const path = require("path");

let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } catch (err) {
    console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT env var:", err);
  }
}

if (!serviceAccount) {
  try {
    const serviceAccountPath = path.join(__dirname, "../firebase-service-account.json");
    serviceAccount = require(serviceAccountPath);
  } catch (err) {
    console.warn("Local firebase-service-account.json not found, falling back to default application credentials.");
  }
}

if (getApps().length === 0) {
  if (serviceAccount) {
    initializeApp({
      credential: cert(serviceAccount)
    });
    console.log("Firebase Connected via service account credentials");
  } else {
    initializeApp();
    console.log("Firebase Connected via default application credentials");
  }
}

const db = getFirestore();

// Build a mock admin object to keep FieldValue utility intact for your routes
const admin = {
  firestore: {
    FieldValue: FieldValue
  }
};

// Export both admin utilities and db
module.exports = { admin, db };
