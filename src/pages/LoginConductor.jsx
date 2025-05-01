import { useState } from "react";
import { useNavigate } from "react-router-dom";

function LoginConductor() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // Validación ficticia
    if (email && password) {
      navigate("/conductor");
    } else {
      alert("Ingresa los datos");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "80px" }}>
      <h2>Login Conductor</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        /><br /><br />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        /><br /><br />
        <button type="submit">Iniciar Sesión</button>
      </form>
    </div>
  );
}

export default LoginConductor;
