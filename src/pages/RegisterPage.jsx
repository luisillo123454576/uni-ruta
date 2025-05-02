// src/pages/RegisterPage.jsx
import { useState } from "react";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("estudiante");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const isValidEmail = (email) => {
    // Expresión regular básica para validar formato de email
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (!isValidEmail(email)) {
      setError("Por favor, ingresa un correo válido.");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Guardar el rol en Firestore
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        role: role,
      });

      // Redirigir según el rol
      if (role === "estudiante") {
        navigate("/estudiante");
      } else {
        navigate("/conductor");
      }

    } catch (err) {
      console.error("Error en el registro:", err);
      setError("Hubo un problema al registrarse. Intenta de nuevo.");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>Registro</h2>
      <form onSubmit={handleRegister} style={{ display: "inline-block", textAlign: "left" }}>
        <div>
          <label>Email:</label><br />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: "250px", padding: "8px" }}
          />
        </div>
        <div>
          <label>Contraseña:</label><br />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: "250px", padding: "8px" }}
          />
        </div>
        <div>
          <label>¿Eres estudiante o conductor?</label><br />
          <select value={role} onChange={(e) => setRole(e.target.value)} style={{ width: "250px", padding: "8px" }}>
            <option value="estudiante">Estudiante</option>
            <option value="conductor">Conductor</option>
          </select>
        </div>
        <br />
        <button type="submit" style={{ padding: "10px 20px" }}>Registrarse</button>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </form>
    </div>
  );
}

export default RegisterPage;
