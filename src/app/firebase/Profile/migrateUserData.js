import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { collection, getDocs } from "firebase/firestore";
// import { Constant_Var_firebase_collectionName_users } from "@/utils/constants";

const NEXT_PUBLIC_FIREBASE_APIKEY = "AIzaSyADynbdFEZDb8txg-tMKaAM3iz_GJrBfn0"
const NEXT_PUBLIC_AUTH_DOMAIN = "aniversehd.firebaseapp.com"
const NEXT_PUBLIC_PROJECTID = "aniversehd"
const NEXT_PUBLIC_STORAGE_BUCKET = "aniversehd.appspot.com"
const NEXT_PUBLIC_APP_ID = "1:9016482533:web:580e08ac91af2c036f120c"

console.log("Firebase Config", {
  apiKey: NEXT_PUBLIC_FIREBASE_APIKEY,
  authDomain: NEXT_PUBLIC_AUTH_DOMAIN,
  // databaseURL: process.env.NEXT_PUBLIC_DATABASE_URL,
  projectId: NEXT_PUBLIC_PROJECTID,
  storageBucket: NEXT_PUBLIC_STORAGE_BUCKET,
  // messagingSenderId: process.env.NEXT_PUBLIC_MESSAGING_SENDERID,
  appId: NEXT_PUBLIC_APP_ID,
  // measurementId: process.env.NEXT_PUBLIC_MEASUREMENT_ID,
});
const firebaseConfig = {
  apiKey: NEXT_PUBLIC_FIREBASE_APIKEY,
  authDomain: NEXT_PUBLIC_AUTH_DOMAIN,
  // databaseURL: process.env.NEXT_PUBLIC_DATABASE_URL,
  projectId: NEXT_PUBLIC_PROJECTID,
  storageBucket: NEXT_PUBLIC_STORAGE_BUCKET,
  // messagingSenderId: process.env.NEXT_PUBLIC_MESSAGING_SENDERID,
  appId: NEXT_PUBLIC_APP_ID,
  // measurementId: process.env.NEXT_PUBLIC_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


async function migrateUsersToD1() {
  try {
    const usersCollection = collection(db, "users");
    const usersSnapshot = await getDocs(usersCollection);

    if (usersSnapshot.empty) {
      console.log("No users found.");
      return;
    }
    var count = 0;
    for (const userDoc of usersSnapshot.docs) {
    
      const userData = userDoc.data();
        count++;
      const payload = {
        userId: userData.uid,
        userName: userData.userName || "",
        userProfileUrl: userData.photoUrl || "",
        userBannerUrl: userData.coverUrl || "",
        email: userData.email || ""
      };

      if (count % 100 === 0) {
        console.log("Payload:", payload);
      }
      

      const response = await fetch("https://aniversehd.shivangkh26.workers.dev/api/v1/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        console.error(`❌ Failed for [${userData.uid}]:`, await response.text());
      } else {
        console.log(`✅ Migrated [${userData.uid}]`);
      }

      if (count % 100 === 0) {
        console.log(`Processed ${count} users...`);
      }
    }

    console.log("🎯 Migration finished.");
  } catch (error) {
    console.error("Error:", error);
  }
}

migrateUsersToD1();
