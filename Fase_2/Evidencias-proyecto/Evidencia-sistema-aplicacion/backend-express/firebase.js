// firebase.js
const { initializeApp, cert } = require('firebase-admin/app');
const { getMessaging } = require('firebase-admin/messaging');

const serviceAccount = JSON.parse(
  Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf-8')
);

const app = initializeApp({
  credential: cert(serviceAccount),
});

module.exports = { app, messaging: getMessaging(app) };