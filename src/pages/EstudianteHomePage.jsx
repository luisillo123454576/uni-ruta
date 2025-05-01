import React from 'react';
import { useNavigate } from 'react-router-dom';

function EstudianteHomePage() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("usuario");
    navigate("/"); // Redirige al login después de logout
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h2>Bienvenido, Estudiante</h2>
      <p>Aquí podrás ver las rutas de los conductores en tiempo real.</p>
      <button onClick={handleLogout}>Cerrar sesión</button>
    </div>
  );
}

export default EstudianteHomePage;
