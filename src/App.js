import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import DriverPage from "./pages/DriverPage";
import StudentPage from "./pages/StudentPage";
import LoginConductor from "./pages/LoginConductor";
import SeleccionarRuta from "./pages/SeleccionarRuta";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login-conductor" element={<LoginConductor />} />
        <Route path="/conductor" element={<DriverPage />} />
        <Route path="/estudiante" element={<StudentPage />} />
        <Route path="/seleccionar-ruta" element={<SeleccionarRuta />} />

      </Routes>
    </Router>
  );
}

export default App;
