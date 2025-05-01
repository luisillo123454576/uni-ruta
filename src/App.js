import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import DriverPage from "./pages/DriverPage";
import StudentPage from "./pages/StudentPage";
import LoginConductor from "./pages/LoginConductor";
import LoginEstudiante from "./pages/LoginEstudiante";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage"; // ✅ Nuevo login unificado
import RecuperarContraseña from "./pages/RecuperarContraseña"; // ✅ Nueva página para recuperar contraseña

function App() {
  return (
    <Router>
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <h1>RutaUni 🚍</h1>

        <nav style={{ marginBottom: "30px" }}>
          <Link to="/login" style={{ margin: "10px", fontWeight: "bold" }}>Login</Link> {/* ✅ Nuevo login */}
          <Link to="/registro" style={{ margin: "10px", color: "green" }}>Registro</Link>
        </nav>

        <Routes>
          <Route path="/login" element={<LoginPage />} /> {/* ✅ Login unificado */}
          <Route path="/login-conductor" element={<LoginConductor />} />
          <Route path="/login-estudiante" element={<LoginEstudiante />} />
          <Route path="/conductor" element={<DriverPage />} />
          <Route path="/estudiante" element={<StudentPage />} />
          <Route path="/registro" element={<RegisterPage />} />
          <Route path="/recuperar-contrasena" element={<RecuperarContraseña />} /> {/* ✅ Ruta para recuperar contraseña */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
