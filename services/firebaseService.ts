
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCvd9icCXSLRs6kdDpCdcfIdz7BGVrSF9I",
  authDomain: "thcine-484d3.firebaseapp.com",
  projectId: "thcine-484d3",
  storageBucket: "thcine-484d3.firebasestorage.app",
  messagingSenderId: "471633277960",
  appId: "1:471633277960:web:dc1278726ba0d0f5df8dbd"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Exporta as instâncias configuradas
export const auth = getAuth(app);
export const db = getFirestore(app);
