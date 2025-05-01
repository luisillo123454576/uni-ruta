import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase"; // Asegúrate de que "auth" esté importado correctamente
import { useNavigate } from "react-router-dom";

function RecuperarContraseña() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setError("");  // Limpiar errores anteriores
    setSuccessMessage(""); // Limpiar mensajes previos

    try {
      // Enviar el correo de restablecimiento de contraseña
      await sendPasswordResetEmail(auth, email);
      setSuccessMessage("Te hemos enviado un correo con las instrucciones para restablecer tu contraseña.");
      setEmail("");  // Limpiar el campo de email
    } catch (err) {
      console.error("Error al enviar el correo de restablecimiento:", err);
      setError("Hubo un problema al enviar el correo. Verifica que el correo sea correcto.");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>Recuperar Contraseña</h2>
      <form onSubmit={handlePasswordReset}>
        <div>
          <label>Email:</label><br />
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ padding: "10px", marginBottom: "10px", width: "250px" }}
          />
        </div>
        <br />
        <button type="submit" style={{ padding: "10px 20px" }}>
          Enviar Correo de Restablecimiento
        </button>
      </form>

      {error && <p style={{ color: "red", marginTop: "15px" }}>{error}</p>}
      {successMessage && <p style={{ color: "green", marginTop: "15px" }}>{successMessage}</p>}

      <div style={{ marginTop: "20px" }}>
        <a href="/login" style={{ color: "blue", textDecoration: "underline" }}>Volver al login</a>
      </div>
    </div>
  );
}

export default RecuperarContraseña;
