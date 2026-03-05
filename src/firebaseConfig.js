import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// PASTE THE VALUES FROM YOUR FIREBASE CONSOLE HERE
const firebaseConfig = {
  apiKey: "AIzaSyDbuSMIL7ZO_ZyeE3-gI3bYS8A3l7XH6VM",
  authDomain: "smart-park-f67e7.firebaseapp.com",
  projectId: "smart-park-f67e7",
  storageBucket: "smart-park-f67e7.firebasestorage.app",
  messagingSenderId: "168445388154",
  appId: "1:168445388154:web:9d98608594282e9cdf62c3",
 
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);