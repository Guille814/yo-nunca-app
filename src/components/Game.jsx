import React, { useState } from "react";

export default function Game({ phrases }) {
  const [remaining, setRemaining] = useState([...phrases]);
  const [history, setHistory] = useState([]); // para ir hacia atrás
  const [current, setCurrent] = useState(null);

  const nextPhrase = () => {
    if (remaining.length === 0) {
      setCurrent("¡Se acabaron las frases! 🎉");
      return;
    }
    const randomIndex = Math.floor(Math.random() * remaining.length);
    const phrase = remaining[randomIndex];

    if (current) setHistory((prev) => [...prev, current]); // guardar anterior
    setCurrent(phrase);
    setRemaining((prev) => prev.filter((_, i) => i !== randomIndex));
  };

  const prevPhrase = () => {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    if (current) setRemaining((prev) => [current, ...prev]); // devolver la actual al pool
    setCurrent(last);
  };

  return (
    <div className="game">
      <p>{current || "Pulsa 'Siguiente frase' para empezar"}</p>
      <div className="game-buttons">
        <button onClick={prevPhrase} disabled={history.length === 0}>
          ← Anterior
        </button>
        <button onClick={nextPhrase}>Siguiente →</button>
      </div>

    </div>
  );
}
