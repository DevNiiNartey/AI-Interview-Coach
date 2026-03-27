// Import the functions you need from the SDKs you need
import {initializeApp, getApps, getApp} from "firebase/app";
import {getAuth} from "firebase/auth";
import {getFirestore} from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
//
// ENV VAR STRATEGY:
// All vars use NEXT_PUBLIC_ prefix so they are available in the browser.
// This file is used by client components (e.g. AuthForm.tsx) which run in the browser.
// Firebase Auth (signInWithEmailAndPassword) requires the client SDK to be initialised
// with valid config values — non-prefixed vars resolve to `undefined` in the browser.
// DO NOT use these vars in firebase/admin.ts (server-only, different vars).
const firebaseConfig = {

    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,

    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,

    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,

    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,

    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,

    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,

    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase — getApps() must be called (not getApps.length which reads function arity)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
