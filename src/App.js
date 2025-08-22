import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

import ModeSelector from "./components/ModeSelector";
import Game from "./components/Game";
import phrases from "./data/phrases.json";
import HostOnline from "./components/HostOnline";
import HostGame from "./components/HostGame";
import PlayerWrapper from "./components/PlayerWrapper";

import "./index.css";

// Hook para leer query params
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function AppWrapper() {
  const query = useQuery();
  const partidaQuery = query.get("partida");

  const [mode, setMode] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [customPhrases, setCustomPhrases] = useState([]);
  const [currentPhrases, setCurrentPhrases] = useState([]);
  const [partidaId, setPartidaId] = useState(partidaQuery || null);

  const resetMode = () => {
    setMode(null);
    setCustomPhrases([]);
    setCurrentPhrases([]);
    setInputValue("");
    setPartidaId(null);
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

  // Fondos + colores según el modo
  const backgroundByMode = {
    normal: { bg: "linear-gradient(to bottom, #ffb347, #ffcc70)", text: "#222" },
    hot: { bg: "linear-gradient(to bottom, #ff5e62, #ff9966)", text: "#fff" },
    mix: { bg: "linear-gradient(to bottom, #6eff62, #a8ff78)", text: "#222" },
    custom: { bg: "linear-gradient(to bottom, #6ee7b7, #34d399)", text: "#222" },
    online: { bg: "linear-gradient(to bottom, #2575fc, #6a11cb)", text: "#fff" }
  };

  // Mostrar el botón de volver en todos los modos que no sean la selección
  const showBackButton = mode !== null;

  return (
    <div
      className="app"
      style={{
        background: mode ? backgroundByMode[mode]?.bg : "rgba(0,0,0,0.3)",
        color: mode ? backgroundByMode[mode]?.text : "white"
      }}
    >
      {/* Header único */}
      {mode && (
        <div className="header">
          {showBackButton && (
            <button className="back-top" onClick={resetMode}>←</button>
          )}
          <h1 style={{ flex: 1, textAlign: "center", margin: 0 }}>Yo Nunca</h1>
          <div style={{ width: "32px" }}></div> {/* espaciador para centrar */}
        </div>
      )}

      {/* Selección de modo */}
      {!mode && (
        <>
          <ModeSelector setMode={setMode} />
          <div className="extra-modes">
            <button onClick={() => setMode("collect")}>Modo Personalizado</button>
            <button onClick={() => setMode("online")}>Modo Online</button>
          </div>
        </>
      )}

      {/* Modo personalizado */}
      {mode === "collect" && (
        <>
          <h2 className="subtitle-white">Añade tus frases</h2>
          <div className="custom-input-container" style={{ marginBottom: "15px" }}>
            <input
              type="text"
              placeholder="Escribe un 'Yo Nunca...'"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && inputValue.trim()) addCustomPhrase(inputValue);
              }}
              className="custom-input"
            />
            <button onClick={() => { if (inputValue.trim()) addCustomPhrase(inputValue); }}>
              Añadir
            </button>
          </div>
          <button className="start-button" onClick={startCustomGame} disabled={customPhrases.length === 0}>
            Empezar Juego
          </button>
          <p>Frases añadidas: {customPhrases.length}</p>
        </>
      )}

      {/* Juego normal/mix/hot/custom */}
      {mode && mode !== "collect" && mode !== "online" && (
        <Game phrases={getPhrasesForMode()} />
      )}

      {/* Modo online */}
      {mode === "online" && !partidaId && (
        <HostOnline setPartidaId={setPartidaId} resetMode={resetMode} />
      )}
      {mode === "online" && partidaId && (
        <HostGame partidaId={partidaId} resetMode={resetMode} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/*" element={<AppWrapper />} />
        <Route path="/online/:partidaId" element={<PlayerWrapper />} />
      </Routes>
    </Router>
  );
}
