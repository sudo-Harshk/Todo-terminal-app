const admin = require("firebase-admin");
const path = require("path");
require("dotenv").config();

const serviceAccount = require(path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

module.exports = db;
