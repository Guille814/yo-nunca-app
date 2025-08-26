import React, { useState } from "react";
import phrasesData from "../data/quienEsMasProbable.json";

export default function QuienEsMasProbable({ mode, resetMode }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  let phrases = [];
  if (mode === "normal") phrases = phrasesData.normal;
  else if (mode === "picante") phrases = phrasesData.picante;
  else phrases = [...phrasesData.normal, ...phrasesData.picante].sort(() => Math.random() - 0.5);

  const currentPhrase = phrases[currentIndex];

  const next = () => {
    if (currentIndex < phrases.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const prev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  return (
    <div className="flex flex-col items-center justify-center gap-6 p-6 text-center min-h-[60vh]">
      <h2 className="text-2xl font-bold text-white/90">{currentPhrase?.pregunta}</h2>
      {currentPhrase?.descripcion && (
        <p className="text-white/70 text-sm max-w-md">{currentPhrase.descripcion}</p>
      )}

      <div className="flex gap-4 mt-6">
        <button
          onClick={prev}
          disabled={currentIndex === 0}
          className="px-6 py-3 bg-gray-700 text-white rounded-xl shadow hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ⬅️ Anterior
        </button>
        <button
          onClick={next}
          disabled={currentIndex === phrases.length - 1}
          className="px-6 py-3 bg-gray-700 text-white rounded-xl shadow hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Siguiente ➡️
        </button>
      </div>

      <button
        onClick={resetMode}
        className="mt-6 px-6 py-3 rounded-xl text-white font-bold bg-gray-700 hover:scale-105 transition-transform"
      >
        ⬅️ Volver al Menú
      </button>
      <p className="text-white/50 mt-2 text-sm">{currentIndex + 1} / {phrases.length}</p>
    </div>
  );
}
