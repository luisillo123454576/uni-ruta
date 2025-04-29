import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { doc, onSnapshot } from "firebase/firestore";

function StudentPage() {
  const [location, setLocation] = useState(null);
  const [routeId, setRouteId] = useState("");
  const [tracking, setTracking] = useState(false);

  useEffect(() => {
    let unsub;
    if (tracking && routeId) {
      const locationRef = doc(db, "locations", routeId);
      unsub = onSnapshot(locationRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          setLocation({ lat: data.lat, lng: data.lng });
        }
      });
    }

    return () => {
      if (unsub) unsub();
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
    <div style={{ textAlign: "center" }}>
      <h2>Mapa de Ruta 🎒</h2>
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
        {tracking ? "Recibiendo ubicación..." : "Iniciar Seguimiento"}
      </button>

      {location ? (
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
      ) : tracking ? (
        <p style={{ marginTop: "20px" }}>Esperando ubicación del conductor...</p>
      ) : null}
    </div>
  );
}

export default StudentPage;
