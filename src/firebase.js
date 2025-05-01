// Importa firebase
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth"; // ← esto es nuevo

// Configuración de Firebase
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

// Exportar base de datos y auth
export const db = getFirestore(app);
export const auth = getAuth(app); // ← esto es clave para login y registro
