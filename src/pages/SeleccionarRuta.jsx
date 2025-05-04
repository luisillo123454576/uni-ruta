import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";

function SeleccionarRuta() {
  const navigate = useNavigate();
  const [rutas, setRutas] = useState([]);
  const [error, setError] = useState("");

  const rutasDisponibles = [
    "15 de mayo",
    "7 de agosto - 7h",
    "Calle 15",
    "Calle 27 a Calle 37",
    "Centro - Coquivacoa",
    "Dividivi",
    "Las Tunas",
    "Majayura",
    "Marbella",
    "Round Point"
  ];

  const [rutaSeleccionada, setRutaSeleccionada] = useState("");

  const handleSeleccion = async () => {
    setError("");
    if (!rutaSeleccionada) {
      setError("Por favor selecciona una ruta.");
      return;
    }

    try {
      // Buscar el documento de la ruta
      const rutasSnapshot = await getDocs(collection(db, "rutas"));
      const rutaDoc = rutasSnapshot.docs.find(
        (doc) => doc.data().nombre === rutaSeleccionada
      );

      if (!rutaDoc) {
        setError("Ruta no encontrada en la base de datos.");
        return;
      }

      // Asignar el UID del conductor a la ruta
      const rutaRef = doc(db, "rutas", rutaDoc.id);
      await updateDoc(rutaRef, {
        conductorUID: auth.currentUser.uid,
      });

      navigate("/conductor");
    } catch (err) {
      console.error("Error al asignar ruta:", err);
      setError("Hubo un problema al guardar la ruta.");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "80px" }}>
      <h2>Seleccionar Ruta</h2>

      <select
        value={rutaSeleccionada}
        onChange={(e) => setRutaSeleccionada(e.target.value)}
        style={{ padding: "10px", width: "250px", marginBottom: "10px" }}
      >
        <option value="">-- Selecciona tu ruta --</option>
        {rutasDisponibles.map((ruta, idx) => (
          <option key={idx} value={ruta}>{ruta}</option>
        ))}
      </select>
      <br />
      <button
        onClick={handleSeleccion}
        style={{ padding: "10px 20px", marginTop: "10px" }}
      >
        Confirmar Ruta
      </button>
      {error && <p style={{ color: "red", marginTop: "15px" }}>{error}</p>}
    </div>
  );
}

export default SeleccionarRuta;
