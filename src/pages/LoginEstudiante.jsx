import { useState } from "react";
import { useNavigate } from "react-router-dom";

function LoginEstudiante() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Usuarios simulados
  const estudiantes = [
    { email: "juan@uni.edu", password: "1234" },
    { email: "maria@uni.edu", password: "abcd" },
    { email: "luis@uni.edu", password: "pass123" },
  ];

  const handleLogin = (e) => {
    e.preventDefault();

    const usuarioValido = estudiantes.find(
      (user) => user.email === email && user.password === password
    );

    if (usuarioValido) {
      navigate("/estudiante");
    } else {
      setError("Correo o contraseña incorrectos");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "80px" }}>
      <h2>Login Estudiante 🎓</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Correo institucional"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: "10px", width: "250px" }}
        />
        <br /><br />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: "10px", width: "250px" }}
        />
        <br /><br />
        <button
          type="submit"
          style={{ padding: "10px 20px", fontWeight: "bold" }}
        >
          Iniciar Sesión
        </button>
      </form>

      {error && (
        <p style={{ color: "red", marginTop: "20px", fontWeight: "bold" }}>
          {error}
        </p>
      )}
    </div>
  );
}

export default LoginEstudiante;
