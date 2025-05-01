import { useState } from "react";
import { useNavigate } from "react-router-dom";

const FormularioLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (email === "correo@uni.edu" && password === "123456") {
      localStorage.setItem("usuario", email);

      // Verificar si el usuario es conductor o estudiante
      if (email === "conductor@uni.edu") {
        navigate("/conductor");
      } else {
        navigate("/estudiante");
      }
    } else {
      setError("Correo o contraseña incorrectos.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-sm mx-auto mt-20">
      <input
        type="email"
        placeholder="Correo"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="p-2 border rounded"
        required
      />
      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="p-2 border rounded"
        required
      />
      <button type="submit" className="bg-blue-600 text-white p-2 rounded">
        Iniciar sesión
      </button>
      {error && <p className="text-red-500">{error}</p>}
    </form>
  );
};

export default FormularioLogin;
