import admin from "firebase-admin";


function formatPrivateKey(key) {
  return key.replace(/\\n/g, "\n");
}

const privateKey = formatPrivateKey(process.env.FIREBASE_ADMIN_PRIVATE_KEY);

if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert({
        project_id: process.env.FIREBASE_ADMIN_PROJECT_ID,
        client_email: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey
    }),
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
  });
}

const app = admin.app();
const auth = admin.auth();

export { app, auth };
