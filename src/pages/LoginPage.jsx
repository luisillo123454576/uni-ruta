import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;

      const userDoc = await getDoc(doc(db, "usuarios", userId));

      if (userDoc.exists()) {
        const { rol } = userDoc.data();

        if (rol === "estudiante") {
          navigate("/estudiante");
        } else if (rol === "conductor") {
          navigate("/conductor");
        } else {
          setError("Rol no definido. Contacta al administrador.");
        }
      } else {
        setError("No se encontró el usuario en Firestore.");
      }
    } catch (err) {
      setError("Correo o contraseña incorrectos.");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>Login 🧑‍💼</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: "10px", marginBottom: "10px", width: "250px" }}
        />
        <br />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: "10px", marginBottom: "10px", width: "250px" }}
        />
        <br />
        <button type="submit" style={{ padding: "10px 20px" }}>
          Iniciar Sesión
        </button>
      </form>
      {error && <p style={{ color: "red", marginTop: "15px" }}>{error}</p>}
      
      {/* Enlace para recuperar la contraseña */}
      <div style={{ marginTop: "20px" }}>
        <a href="/recuperar-contrasena" style={{ color: "blue", textDecoration: "underline" }}>¿Olvidaste tu contraseña?</a>
      </div>
    </div>
  );
}

export default LoginPage;
