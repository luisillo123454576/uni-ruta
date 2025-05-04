import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";

function LoginConductor() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // Iniciar sesión
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Verificar que sea conductor
      const userDocRef = doc(db, "usuarios", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists() && userDoc.data().rol === "conductor") {
        // Verificar si ya tiene una ruta asignada
        const rutasSnapshot = await getDocs(collection(db, "rutas"));
        let rutaAsignada = null;

        rutasSnapshot.forEach(doc => {
          const data = doc.data();
          if (data.conductorUID === user.uid) {
            rutaAsignada = doc.id;
          }
        });

        if (rutaAsignada) {
          navigate("/conductor");
        } else {
          navigate("/seleccionar-ruta");
        }

      } else {
        setError("No tienes permisos para acceder como conductor.");
        await auth.signOut();
      }
    } catch (err) {
      console.error("Error al iniciar sesión:", err);
      setError("Correo o contraseña incorrectos.");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "80px" }}>
      <h2>Login Conductor</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Correo institucional"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: "10px", marginBottom: "10px", width: "250px" }}
        />
        <br />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: "10px", marginBottom: "10px", width: "250px" }}
        />
        <br />
        <button type="submit" style={{ padding: "10px 20px" }}>Ingresar</button>
      </form>
      {error && <p style={{ color: "red", marginTop: "15px" }}>{error}</p>}
    </div>
  );
}

export default LoginConductor;
