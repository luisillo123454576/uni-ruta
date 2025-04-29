// Importa firebase
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Tu configuración de Firebase aquí
const firebaseConfig = {
    apiKey: "AIzaSyD23fWAy7SoCeTYc1Xrzt4FwPB8srG8dr8",
    authDomain: "rutauni-estudiante.firebaseapp.com",
    projectId: "rutauni-estudiante",
    storageBucket: "rutauni-estudiante.firebasestorage.app",
    messagingSenderId: "860539671175",
    appId: "1:860539671175:web:206b98cab0612ffb591e22"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Exporta la base de datos
export const db = getFirestore(app);
