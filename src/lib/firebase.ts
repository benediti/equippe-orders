// src/lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// ATENÇÃO: Você precisa substituir os valores abaixo pelas chaves do seu projeto no console do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBXZGOireCk8Q1iF8CmaSMDiHgqzyUz66o",
    authDomain: "gen-lang-client-0921435570.firebaseapp.com",
    projectId: "gen-lang-client-0921435570",
    storageBucket: "gen-lang-client-0921435570.firebasestorage.app",
    messagingSenderId: "212933302056",
    appId: "1:212933302056:web:943b556825b8d78d57a21d",
    measurementId: "G-NH2XVYB66F"
  };

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);