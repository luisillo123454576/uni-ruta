import React from 'react';
import { useNavigate } from 'react-router-dom';

function ConductorHomePage() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("usuario");
    navigate("/"); // Redirige al login después de logout
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h2>Bienvenido, Conductor</h2>
      <p>Aquí puedes compartir tu ubicación en tiempo real.</p>
      <button onClick={handleLogout}>Cerrar sesión</button>
    </div>
  );
}

export default ConductorHomePage;
