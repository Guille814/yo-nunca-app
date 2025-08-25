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
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!partidaId) return;

    const partidaRef = doc(db, "partidas", partidaId);
    const unsubscribe = onSnapshot(partidaRef, (snapshot) => {
      const data = snapshot.data();
      if (!data) return;

      setFrases(data.frases || []);

      // Inicializamos remaining solo una vez
      if (!initialized && data.frases?.length > 0) {
        setRemaining(data.frases);
        setInitialized(true);
      }

      if (data.started) setStarted(true);
      if (data.currentPhrase) setCurrent(data.currentPhrase);
    });

    return () => unsubscribe();
  }, [partidaId, initialized]);

  const addPhrase = async () => {
    const newPhrase = inputPhrase.trim();
    if (!newPhrase) return;

    if (frases.some(f => f.toLowerCase().trim() === newPhrase.toLowerCase())) {
      alert("Esa frase ya ha sido añadida");
      return;
    }

    const partidaRef = doc(db, "partidas", partidaId);
    await updateDoc(partidaRef, { frases: arrayUnion(newPhrase) });
    setInputPhrase("");
    setRemaining(prev => [...prev, newPhrase]); // Añade también a remaining
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
    <div className="app">
      <h1 className="subtitle-white">Partida {partidaId}</h1>

      {!started && (
        <>
          <p className="subtitle-white">Añade tus frases antes de empezar:</p>
          <div className="custom-input-container">
            <input
              className="custom-input"
              type="text"
              placeholder="Escribe un 'Yo Nunca...'"
              value={inputPhrase}
              onChange={(e) => setInputPhrase(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") addPhrase(); }}
            />
            <button onClick={addPhrase}>Añadir</button>
          </div>
          <p className="subtitle-white">Frases totales: {frases.length}</p>
        </>
      )}

      {started && (
        <>
          <p className="game">{current || "Esperando que el host pase las frases..."}</p>
          <div className="game-buttons">
            <button onClick={nextPhrase}>Siguiente frase</button>
          </div>

          <div className="custom-input-container">
            <input
              className="custom-input"
              type="text"
              placeholder="Añade otra frase"
              value={inputPhrase}
              onChange={(e) => setInputPhrase(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") addPhrase(); }}
            />
            <button onClick={addPhrase}>Añadir</button>
          </div>

          <p className="subtitle-white">Frases totales: {frases.length}</p>
        </>
      )}
    </div>
  );
}
