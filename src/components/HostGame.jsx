import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { doc, updateDoc, onSnapshot, serverTimestamp, deleteDoc } from "firebase/firestore";

export default function HostGame({ partidaId }) {
  const [frases, setFrases] = useState([]);
  const [remaining, setRemaining] = useState([]);
  const [history, setHistory] = useState([]);
  const [current, setCurrent] = useState(null);
  const [showContinue, setShowContinue] = useState(false);

  useEffect(() => {
    if (!partidaId) return;
    const partidaRef = doc(db, "partidas", partidaId);

    const unsubscribe = onSnapshot(partidaRef, (snapshot) => {
      const data = snapshot.data();
      if (!data) return;

      setFrases(data.frases || []);
      setRemaining(data.frases || []);

      const ultima = data.ultimaFrase?.toDate();
      if (!ultima) return;

      const now = new Date();
      const diffMs = now - ultima;
      const diffMin = diffMs / (1000 * 60);

      // Mostrar botón si ha pasado 60 min
      setShowContinue(diffMin >= 60);

      // Borrar partida automáticamente si estaba pendiente y han pasado 65 min
      if (data.status === "pendiente" && diffMin >= 65) {
        deleteDoc(partidaRef);
      }
    });

    return () => unsubscribe();
  }, [partidaId]);

  const nextPhrase = async () => {
    if (remaining.length === 0) {
      setCurrent("¡Se acabaron las frases! 🎉");
      return;
    }

    const randomIndex = Math.floor(Math.random() * remaining.length);
    const phrase = remaining[randomIndex];

    if (current) setHistory((prev) => [...prev, current]);
    setCurrent(phrase);
    setRemaining((prev) => prev.filter((_, i) => i !== randomIndex));

    // Actualizamos la hora de la última frase en Firestore
    const partidaRef = doc(db, "partidas", partidaId);
    await updateDoc(partidaRef, { ultimaFrase: serverTimestamp() });
  };

  const prevPhrase = () => {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    if (current) setRemaining((prev) => [current, ...prev]);
    setCurrent(last);
  };

  const handleContinue = async (seguir) => {
    const partidaRef = doc(db, "partidas", partidaId);
    if (seguir) {
      await updateDoc(partidaRef, { status: "activo", ultimaFrase: serverTimestamp() });
      setShowContinue(false);
    } else {
      await deleteDoc(partidaRef);
    }
  };

  return (
    <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: "20px", maxWidth: "400px", margin: "0 auto" }}>
      <p>{current || "Pulsa 'Siguiente frase' para empezar"}</p>

      <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
        <button onClick={prevPhrase} disabled={history.length === 0} style={{ padding: "10px 20px", borderRadius: "8px", cursor: history.length === 0 ? "not-allowed" : "pointer" }}>
          ← Anterior
        </button>
        <button onClick={nextPhrase} style={{ padding: "10px 20px", borderRadius: "8px", cursor: "pointer" }}>
          Siguiente →
        </button>
      </div>

      {showContinue && (
        <div>
          <p>¿Quieres seguir jugando?</p>
          <button onClick={() => handleContinue(true)} style={{ marginRight: "10px", padding: "8px 16px", borderRadius: "8px" }}>Sí</button>
          <button onClick={() => handleContinue(false)} style={{ padding: "8px 16px", borderRadius: "8px" }}>No</button>
        </div>
      )}
    </div>
  );
}
