import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { doc, onSnapshot, getDocs, collection } from "firebase/firestore";

function StudentPage() {
  const [location, setLocation] = useState(null);
  const [routeId, setRouteId] = useState("");
  const [tracking, setTracking] = useState(false);
  const [rutasDisponibles, setRutasDisponibles] = useState([]);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    const cargarRutasActivas = async () => {
      const snapshot = await getDocs(collection(db, "rutas"));
      const rutas = snapshot.docs
        .filter((doc) => doc.data().enServicio === true) // ✅ Solo rutas activas
        .map((doc) => ({
          id: doc.id,
          nombre: doc.data().nombre || doc.id,
        }));
      setRutasDisponibles(rutas);
    };

    cargarRutasActivas();
  }, []);

  useEffect(() => {
    let unsubLocation;
    let unsubRuta;

    if (tracking && routeId) {
      // Escuchar ubicación
      const locationRef = doc(db, "locations", routeId);
      unsubLocation = onSnapshot(locationRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          setLocation({ lat: data.lat, lng: data.lng });
          setMensaje(""); // Limpiar mensaje si hay ubicación
        } else {
          setLocation(null);
          setMensaje("El conductor ya no está compartiendo ubicación.");
        }
      });

      // Escuchar estado de la ruta
      const rutaRef = doc(db, "rutas", routeId);
      unsubRuta = onSnapshot(rutaRef, (rutaSnapshot) => {
        if (rutaSnapshot.exists()) {
          const data = rutaSnapshot.data();
          if (data.enServicio === false) {
            setLocation(null);
            setMensaje("Esta ruta está fuera de servicio.");
          }
        }
      });
    }

    return () => {
      if (unsubLocation) unsubLocation();
      if (unsubRuta) unsubRuta();
    };
  }, [tracking, routeId]);

  const startTracking = () => {
    if (!routeId) {
      alert("Por favor selecciona una ruta.");
      return;
    }
    setTracking(true);
    setMensaje(""); // Reiniciar mensaje
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h2>Mapa de Ruta 🎒</h2>

      <select
        value={routeId}
        onChange={(e) => setRouteId(e.target.value)}
        style={{ padding: "10px", width: "250px" }}
        disabled={tracking}
      >
        <option value="">-- Selecciona una ruta activa --</option>
        {rutasDisponibles.map((ruta) => (
          <option key={ruta.id} value={ruta.id}>
            {ruta.nombre}
          </option>
        ))}
      </select>

      <br />
      <br />
      <button
        onClick={startTracking}
        style={{ padding: "10px 20px" }}
        disabled={tracking}
      >
        {tracking ? "Recibiendo ubicación..." : "Iniciar Seguimiento"}
      </button>

      {mensaje && (
        <p style={{ marginTop: "20px", color: "red", fontWeight: "bold" }}>{mensaje}</p>
      )}

      {location && (
        <div style={{ marginTop: "30px" }}>
          <div style={{ height: "400px", width: "80%", margin: "auto" }}>
            <iframe
              width="100%"
              height="100%"
              loading="lazy"
              allowFullScreen
              src={`https://www.google.com/maps?q=${location.lat},${location.lng}&z=15&output=embed`}
              title="Mapa de Ruta"
              style={{ borderRadius: "10px" }}
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentPage;
