import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase";
import { doc, updateDoc, onSnapshot, arrayUnion } from "firebase/firestore";

export default function PlayerWrapper({ resetMode }) {
  const { partidaId } = useParams();
  const [frases, setFrases] = useState([]);
  const [current, setCurrent] = useState(null);
  const [remaining, setRemaining] = useState([]);
  const [inputPhrase, setInputPhrase] = useState("");
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!partidaId) return;

    const partidaRef = doc(db, "partidas", partidaId);
    const unsubscribe = onSnapshot(partidaRef, (snapshot) => {
      const data = snapshot.data();
      if (!data) return;

      setFrases(data.frases || []);
      if (!started) setRemaining(data.frases || []);
      if (data.started) setStarted(true);
      if (data.currentPhrase) setCurrent(data.currentPhrase);
    });

    return () => unsubscribe();
  }, [partidaId, started]);

  const addPhrase = async () => {
    const newPhrase = inputPhrase.trim();
    if (!newPhrase) return;

    // Evitar frases repetidas
    if (frases.some(f => f.toLowerCase().trim() === newPhrase.toLowerCase())) {
      alert("Esa frase ya ha sido añadida");
      return;
    }

    const partidaRef = doc(db, "partidas", partidaId);
    await updateDoc(partidaRef, { frases: arrayUnion(newPhrase) });
    setInputPhrase("");
  };

  const nextPhrase = async () => {
    if (remaining.length === 0) {
      setCurrent("¡Se acabaron las frases! 🎉");
      return;
    }
    const index = Math.floor(Math.random() * remaining.length);
    const phrase = remaining[index];
    setCurrent(phrase);
    setRemaining(prev => prev.filter((_, i) => i !== index));

    const partidaRef = doc(db, "partidas", partidaId);
    await updateDoc(partidaRef, { currentPhrase: phrase });
  };

  return (
    <div style={{ textAlign: "center", maxWidth: "400px", margin: "0 auto", paddingTop: "20px" }}>
      <h2>Jugador conectado a la partida {partidaId}</h2>

      {!started && (
        <>
          <p>Añade tus frases antes de empezar:</p>
          <input
            type="text"
            placeholder="Escribe un 'Yo Nunca...'"
            value={inputPhrase}
            onChange={(e) => setInputPhrase(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") addPhrase(); }}
            style={{ width: "100%", padding: "10px", borderRadius: "10px", marginBottom: "10px" }}
          />
          <button onClick={addPhrase} style={{ padding: "10px 20px", borderRadius: "10px" }}>Añadir frase</button>
        </>
      )}

      {started && (
        <>
          <p style={{ fontSize: "1.2rem", minHeight: "60px" }}>{current || "Esperando que el host pase las frases..."}</p>
          <button onClick={nextPhrase} style={{ padding: "12px 20px", borderRadius: "12px" }}>Siguiente frase</button>

          <div style={{ marginTop: "20px" }}>
            <input
              type="text"
              placeholder="Añade otra frase"
              value={inputPhrase}
              onChange={(e) => setInputPhrase(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") addPhrase(); }}
              style={{ width: "100%", padding: "10px", borderRadius: "10px", marginBottom: "10px" }}
            />
            <button onClick={addPhrase} style={{ padding: "10px 20px", borderRadius: "10px" }}>Añadir frase</button>
          </div>

          <p>Frases totales: {frases.length}</p>
        </>
      )}
    </div>
  );
}
