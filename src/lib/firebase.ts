// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = !getApps().length ? initializeApp({
    ...firebaseConfig,
    databaseURL: "https://america-screener-default-rtdb.asia-southeast1.firebasedatabase.app" // Hardcoded for immediate fix
}) : getApp();
console.log("[Firebase] Init with URL:", "https://america-screener-default-rtdb.asia-southeast1.firebasedatabase.app");

// Initialize Realtime Database and Auth only if config is valid
let database: any;
try {
    if (firebaseConfig.databaseURL) {
        database = getDatabase(app);
    } else {
        console.warn("Firebase Database URL is missing. Real-time features will be disabled.");
    }
} catch (e) {
    console.error("Firebase initialization error:", e);
}

export { database };
