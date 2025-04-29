import { useState, useEffect } from "react";
import { db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";

function DriverPage() {
  const [routeId, setRouteId] = useState("");
  const [tracking, setTracking] = useState(false);
  const [location, setLocation] = useState(null);

  useEffect(() => {
    let watchId;

    if (tracking) {
      if ("geolocation" in navigator) {
        watchId = navigator.geolocation.watchPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            setLocation({ lat: latitude, lng: longitude });

            // Guardar siempre en el mismo documento para la ruta
            const locationRef = doc(db, "locations", routeId);
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
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [tracking, routeId]);

  const startTracking = () => {
    if (!routeId) {
      alert("Por favor ingresa el identificador de la ruta.");
      return;
    }
    setTracking(true);
  };

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <h2>Modo Conductor 🚗</h2>
      <input
        type="text"
        placeholder="Identificador de Ruta"
        value={routeId}
        onChange={(e) => setRouteId(e.target.value)}
        style={{ padding: "10px", width: "250px" }}
        disabled={tracking}
      />
      <br /><br />
      <button onClick={startTracking} style={{ padding: "10px 20px" }} disabled={tracking}>
        {tracking ? "Enviando ubicación..." : "Iniciar Ruta"}
      </button>

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
