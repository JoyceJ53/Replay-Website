
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCMAseWsmQDeNSl6MzVwwXtrxouKQIYG_c",
  authDomain: "replay-website-f0b69.firebaseapp.com",
  projectId: "replay-website-f0b69",
  storageBucket: "replay-website-f0b69.firebasestorage.app",
  messagingSenderId: "612355458187",
  appId: "1:612355458187:web:0b2ee6b7167ee36f00c08e",
  measurementId: "G-E6D9LXBKF3",
};

const app = initializeApp(firebaseConfig);

const analytics = getAnalytics(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const db = getFirestore(app);

export { auth, googleProvider, db };
