// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD9SzT6ul696msbdviP5lVNP2Q_lNy2N1E",
  authDomain: "eventfirebase-41c76.firebaseapp.com",
  projectId: "eventfirebase-41c76",
  storageBucket: "eventfirebase-41c76.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdefghijklmnop"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app; 