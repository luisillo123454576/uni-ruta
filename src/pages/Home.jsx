import { useNavigate } from "react-router-dom";

function HomePage() {
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    if (role === "conductor") {
      navigate("/login-conductor");
    } else {
      navigate("/login-estudiante");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>Bienvenido a RutaUni 🚀</h2>
      <p>Selecciona tu rol para continuar</p>
      <div style={{ marginTop: "20px" }}>
        <button
          onClick={() => handleRoleSelect("conductor")}
          style={{
            padding: "10px 20px",
            fontSize: "18px",
            margin: "10px",
            cursor: "pointer",
          }}
        >
          Soy Conductor
        </button>
        <button
          onClick={() => handleRoleSelect("estudiante")}
          style={{
            padding: "10px 20px",
            fontSize: "18px",
            margin: "10px",
            cursor: "pointer",
          }}
        >
          Soy Estudiante
        </button>
      </div>
    </div>
  );
}

export default HomePage;
