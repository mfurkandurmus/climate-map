// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBliEDM9nZoYoubtFaE0MrQ8En6wBblNvI",
  authDomain: "climate-reality-forest.firebaseapp.com",
  projectId: "climate-reality-forest",
  storageBucket: "climate-reality-forest.firebasestorage.app",
  messagingSenderId: "915433790065",
  appId: "1:915433790065:web:9579bc33038704ef5ad9d0",
  measurementId: "G-WVJ2EF2JJ6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

export { app, db }; // db'yi dışa aktar
export const auth = getAuth(app);