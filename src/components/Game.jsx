import React, { useState } from "react";

export default function Game({ mode, phrases }) {
  const [current, setCurrent] = useState(null);

  const nextPhrase = () => {
    const randomIndex = Math.floor(Math.random() * phrases.length);
    setCurrent(phrases[randomIndex]);
  };

  return (
    <div className="game">
      <p>{current || "Pulsa Siguiente frase"}</p>
      <button onClick={nextPhrase}>Siguiente frase</button>
    </div>
  );
}
