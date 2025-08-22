// firebase.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore"; // Importa Firestore

const firebaseConfig = {
  apiKey: "AIzaSyB7gQgZA3o6EEmJLkCeqgY9NeP80om9-gQ",
  authDomain: "yo-nunca-11f97.firebaseapp.com",
  projectId: "yo-nunca-11f97",
  storageBucket: "yo-nunca-11f97.firebasestorage.app",
  messagingSenderId: "52043763014",
  appId: "1:52043763014:web:7d2c71638a1ead150da947",
  measurementId: "G-MECS6MPPBS"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Inicializa Firestore y exporta
export const db = getFirestore(app);
