import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import DriverPage from "./pages/DriverPage";
import StudentPage from "./pages/StudentPage";
import LoginConductor from "./pages/LoginConductor"; // Importa la página nueva

<Route path="/login-conductor" element={<LoginConductor />} />

function App() {
  return (
    <Router>
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <h1>RutaUni Estudiantes</h1>
        <nav>
          <Link to="/conductor" style={{ margin: "10px" }}>Conductor</Link>
          <Link to="/estudiante" style={{ margin: "10px" }}>Estudiante</Link>
        </nav>

        <Routes>
          <Route path="/conductor" element={<DriverPage />} />
          <Route path="/estudiante" element={<StudentPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
