import React, { useState } from "react";

export default function Game({ phrases }) {
  const [remaining, setRemaining] = useState([...phrases]);
  const [current, setCurrent] = useState(null);

  const nextPhrase = () => {
    if (remaining.length === 0) {
      setCurrent("¡Se acabaron las frases! 🎉");
      return;
    }
    const randomIndex = Math.floor(Math.random() * remaining.length);
    const phrase = remaining[randomIndex];
    setCurrent(phrase);
    setRemaining((prev) => prev.filter((_, i) => i !== randomIndex));
  };

  return (
    <div className="game">
      <p>{current || "Pulsa 'Siguiente frase' para empezar"}</p>
      <button onClick={nextPhrase}>Siguiente frase</button>
    </div>
  );
}
