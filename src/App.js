import React, { useState } from "react";
import ModeSelector from "./components/ModeSelector";
import Game from "./components/Game";
import phrases from "./data/phrases.json";
import "./index.css";

function App() {
  const [mode, setMode] = useState(null);
  const [inputValue, setInputValue] = useState(""); // Hook dentro del componente
  const [customPhrases, setCustomPhrases] = useState([]);
  const [currentPhrases, setCurrentPhrases] = useState([]);

  const resetMode = () => {
    setMode(null);
    setCustomPhrases([]);
    setCurrentPhrases([]);
    setInputValue("");
  };

  const addCustomPhrase = (phrase) => {
    if (phrase.trim()) {
      setCustomPhrases((prev) => [...prev, phrase]);
      setInputValue("");
    }
  };

  const startCustomGame = () => {
    const shuffled = [...customPhrases].sort(() => Math.random() - 0.5);
    setCurrentPhrases(shuffled);
    setMode("custom");
  };

  const getPhrasesForMode = () => {
    if (mode === "mix") return [...phrases.normal, ...phrases.hot];
    if (mode === "custom") return currentPhrases;
    return phrases[mode];
  };

  return (
    <div className="app">
      <h1>Yo Nunca</h1>

      {!mode && (
        <>
          <ModeSelector setMode={setMode} />
          <div className="mode-selector" style={{ marginTop: "10px" }}>
            <button
              style={{ backgroundColor: "#6ee7b7", color: "#333" }}
              onClick={() => setMode("collect")}
            >
              Modo Personalizado
            </button>
          </div>
        </>
      )}

      {mode === "collect" && (
        <>
          <h2>Añade tus frases</h2>
          <div className="custom-input-container">
            <input
              type="text"
              placeholder="Escribe un 'Yo Nunca...'"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && inputValue.trim()) {
                  addCustomPhrase(inputValue);
                }
              }}
            />
            <button
              onClick={() => {
                if (inputValue.trim()) addCustomPhrase(inputValue);
              }}
            >
              Añadir
            </button>
          </div>
          <button
            className="start-button"
            onClick={startCustomGame}
            disabled={customPhrases.length === 0}
          >
            Empezar Juego
          </button>
          <p>Frases añadidas: {customPhrases.length}</p>
        </>
      )}

      {mode && mode !== "collect" && (
        <>
          <Game phrases={getPhrasesForMode()} />
          <button className="back-button" onClick={resetMode}>
            ← Volver a elegir modo
          </button>
        </>
      )}
    </div>
  );
}

export default App;
