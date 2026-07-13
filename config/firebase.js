const { initializeApp, cert, getApps } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const path = require("path");

// Resolve the path to the service account file in your root folder
const serviceAccountPath = path.join(__dirname, "../firebase-service-account.json");
const serviceAccount = require(serviceAccountPath);

if (getApps().length === 0) {
  initializeApp({
    credential: cert(serviceAccount)
  });
  console.log("Firebase Connected Cleanly via Config Layer");
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
