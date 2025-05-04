import { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  doc,
  setDoc,
  getDocs,
  collection,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

function DriverPage() {
  const [rutas, setRutas] = useState([]);
  const [routeId, setRouteId] = useState("");
  const [tracking, setTracking] = useState(false);
  const [location, setLocation] = useState(null);

  // 🔄 Cargar rutas desde Firestore
  useEffect(() => {
    const cargarRutas = async () => {
      const snapshot = await getDocs(collection(db, "rutas"));
      const rutas = snapshot.docs.map((doc) => ({
        id: doc.id, // Este debe ser un ID personalizado: ej. "ruta_15_mayo"
        nombre: doc.data().nombre || doc.id,
      }));
      setRutas(rutas);
    };

    cargarRutas();
  }, []);

  // 📍 Escuchar cambios de ubicación
  useEffect(() => {
    let watchId;

    const iniciarGeolocalizacion = () => {
      if ("geolocation" in navigator) {
        watchId = navigator.geolocation.watchPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            setLocation({ lat: latitude, lng: longitude });

            const locationRef = doc(db, "locations", routeId); // ID de la ruta
            await setDoc(locationRef, {
              lat: latitude,
              lng: longitude,
              timestamp: Date.now(),
            });

            console.log("Ubicación enviada:", latitude, longitude);
          },
          (error) => {
            console.error("Error obteniendo ubicación", error);
          },
          {
            enableHighAccuracy: true,
            maximumAge: 10000,
            timeout: 5000,
          }
        );
      } else {
        alert("La geolocalización no está disponible en este dispositivo.");
      }
    };

    if (tracking && routeId) {
      iniciarGeolocalizacion();

      // Marcar ruta como en servicio
      updateDoc(doc(db, "rutas", routeId), {
        enServicio: true,
      });
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [tracking, routeId]);

  // 🚀 Iniciar seguimiento
  const startTracking = () => {
    if (!routeId) {
      alert("Por favor selecciona una ruta.");
      return;
    }
    setTracking(true);
  };

  // 🛑 Detener seguimiento
  const stopTracking = async () => {
    setTracking(false);
    setLocation(null);

    // Marcar ruta como fuera de servicio
    await updateDoc(doc(db, "rutas", routeId), {
      enServicio: false,
    });

    // Eliminar ubicación actual
    await deleteDoc(doc(db, "locations", routeId));

    console.log("Ruta detenida y ubicación eliminada.");
  };

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <h2>Modo Conductor 🚗</h2>

      <select
        value={routeId}
        onChange={(e) => setRouteId(e.target.value)}
        style={{ padding: "10px", width: "250px" }}
        disabled={tracking}
      >
        <option value="">-- Selecciona tu ruta --</option>
        {rutas.map((ruta) => (
          <option key={ruta.id} value={ruta.id}>
            {ruta.nombre}
          </option>
        ))}
      </select>

      <br /><br />
      <button
        onClick={startTracking}
        style={{ padding: "10px 20px", marginRight: "10px" }}
        disabled={tracking}
      >
        {tracking ? "Enviando ubicación..." : "Iniciar Ruta"}
      </button>

      {tracking && (
        <button
          onClick={stopTracking}
          style={{ padding: "10px 20px", backgroundColor: "red", color: "white" }}
        >
          Detener Ruta
        </button>
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
              title="Mapa de Conductor"
              style={{ borderRadius: "10px" }}
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
}

export default DriverPage;
