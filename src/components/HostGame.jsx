import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { doc, updateDoc, onSnapshot, serverTimestamp, deleteDoc } from "firebase/firestore";

export default function HostGame({ partidaId }) {
  const [frases, setFrases] = useState([]);
  const [current, setCurrent] = useState(null);
  const [remaining, setRemaining] = useState([]);
  const [showContinue, setShowContinue] = useState(false);

  useEffect(() => {
    if (!partidaId) return;

    const partidaRef = doc(db, "partidas", partidaId);

    // Escuchamos cambios en la partida en tiempo real
    const unsubscribe = onSnapshot(partidaRef, (snapshot) => {
      const data = snapshot.data();
      if (!data) return;

      setFrases(data.frases || []);
      setRemaining(data.frases || []);

      // Lógica de "quieres seguir jugando"
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
    setCurrent(phrase);
    setRemaining((prev) => prev.filter((_, i) => i !== randomIndex));

    // Actualizamos la hora de la última frase en Firestore
    const partidaRef = doc(db, "partidas", partidaId);
    await updateDoc(partidaRef, {
      ultimaFrase: serverTimestamp()
    });
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
    <div>
      <p>{current || "Pulsa 'Siguiente frase' para empezar"}</p>
      <button onClick={nextPhrase}>Siguiente frase</button>

      {showContinue && (
        <div>
          <p>¿Quieres seguir jugando?</p>
          <button onClick={() => handleContinue(true)}>Sí</button>
          <button onClick={() => handleContinue(false)}>No</button>
        </div>
      )}
    </div>
  );
}
