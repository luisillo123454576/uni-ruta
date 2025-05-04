// src/pages/HomePage.jsx
import { useNavigate } from "react-router-dom";

function HomePage() {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h2>¿Eres estudiante o conductor?</h2>
      <div style={{ marginTop: "40px" }}>
        <button
          style={{ marginRight: "20px", padding: "15px 30px", fontSize: "16px" }}
          onClick={() => navigate("/estudiante")}
        >
          Soy Estudiante
        </button>
        <button
          style={{ padding: "15px 30px", fontSize: "16px" }}
          onClick={() => navigate("/login-conductor")}
        >
          Soy Conductor
        </button>
      </div>
    </div>
  );
}

export default HomePage;
