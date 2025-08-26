import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

import ModeSelector from "./components/ModeSelector";
import Game from "./components/Game";
import phrases from "./data/phrases.json";
import HostOnline from "./components/HostOnline";
import HostGame from "./components/HostGame";
import PlayerWrapper from "./components/PlayerWrapper";
import QuienEsMasProbable from "./components/QuienEsMasProbable";

import "./index.css";

// Hook para leer query params
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function AppWrapper() {
  const query = useQuery();
  const partidaQuery = query.get("partida");

  const [mainMode, setMainMode] = useState(null);
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
    setMainMode(null);
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

  const backgroundByMode = {
    normal: { bg: "linear-gradient(to bottom, #ffb347, #ffcc70)", text: "#222" },
    hot: { bg: "linear-gradient(to bottom, #ff5e62, #ff9966)", text: "#fff" },
    mix: { bg: "linear-gradient(to bottom, #6eff62, #a8ff78)", text: "#222" },
    custom: { bg: "linear-gradient(to bottom, #6ee7b7, #34d399)", text: "#222" },
    online: { bg: "linear-gradient(to bottom, #2575fc, #6a11cb)", text: "#fff" }
  };

  const showBackButton = mainMode !== null && mode !== null;

  return (
    <div
      className="app min-h-screen flex flex-col items-center justify-center"
      style={{
        background: mode ? backgroundByMode[mode]?.bg : "rgba(0,0,0,0.3)",
        color: mode ? backgroundByMode[mode]?.text : "white"
      }}
    >
      {/* Header */}
      {(mainMode || mode) && (
        <div className="header flex items-center w-full px-4 py-3 bg-black/30 backdrop-blur-md">
          {showBackButton && (
            <button
              className="back-top text-xl font-bold hover:scale-110 transition-transform"
              onClick={resetMode}
            >
              ←
            </button>
          )}
          <h1 className="flex-1 text-center text-2xl font-extrabold tracking-wide">Juegos</h1>
          <div className="w-8"></div>
        </div>
      )}

      {/* Pantalla inicial */}
      {!mainMode && (
        <div className="main-menu flex flex-col gap-8 items-center">
          <button
            onClick={() => setMainMode("yonunca")}
            className="btn-yonunca"
          >
            🍻 Yo Nunca
          </button>
          <button
            onClick={() => setMainMode("quienesmasprobable")}
            className="btn-quien"
          >
            🤔 Quién es más probable
          </button>
        </div>
      )}

      {/* Selección de modos SOLO si eligió "Yo Nunca" */}
      {mainMode === "yonunca" && !mode && (
        <>
          <ModeSelector setMode={setMode} />
          <div className="extra-modes flex flex-col gap-4 mt-6">
            <button
              onClick={() => setMode("collect")}
              className="px-6 py-3 rounded-xl text-lg font-semibold text-white 
                         bg-gradient-to-r from-green-400 to-emerald-500 shadow hover:scale-105 transition"
            >
              ✏️ Modo Personalizado
            </button>
            <button
              onClick={() => setMode("online")}
              className="px-6 py-3 rounded-xl text-lg font-semibold text-white 
                         bg-gradient-to-r from-blue-500 to-cyan-500 shadow hover:scale-105 transition"
            >
              🌐 Modo Online
            </button>
            {/* Botón volver separado */}
            <button
              className="w-full mt-6 px-6 py-3 rounded-xl text-white font-bold bg-gray-700 hover:scale-105 transition-transform"
              onClick={resetMode}
            >
              ⬅️ Volver
            </button>
          </div>
        </>
      )}

      {/* Modo personalizado */}
      {mainMode === "yonunca" && mode === "collect" && (
        <>
          <h2 className="subtitle-white text-xl font-bold">Añade tus frases</h2>
          <div className="custom-input-container flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Escribe un 'Yo Nunca...'"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && inputValue.trim()) addCustomPhrase(inputValue);
              }}
              className="custom-input px-3 py-2 rounded-xl border border-gray-300 text-black w-64"
            />
            <button
              onClick={() => { if (inputValue.trim()) addCustomPhrase(inputValue); }}
              className="px-4 py-2 bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-xl shadow hover:scale-105 transition-transform"
            >
              Añadir
            </button>
          </div>
          <button
            className="start-button px-6 py-3 rounded-xl text-lg bg-gradient-to-r from-green-500 to-teal-500 text-white shadow hover:scale-105 transition-transform"
            onClick={startCustomGame}
            disabled={customPhrases.length === 0}
          >
            Empezar Juego
          </button>
          <p className="mt-2">Frases añadidas: {customPhrases.length}</p>
        </>
      )}

      {/* Juego normal/mix/hot/custom */}
      {mainMode === "yonunca" && mode && mode !== "collect" && mode !== "online" && (
        <Game phrases={getPhrasesForMode()} />
      )}

      {/* Modo online */}
      {mainMode === "yonunca" && mode === "online" && !partidaId && (
        <HostOnline setPartidaId={setPartidaId} resetMode={resetMode} />
      )}
      {mainMode === "yonunca" && mode === "online" && partidaId && (
        <HostGame partidaId={partidaId} resetMode={resetMode} />
      )}

      {/* Pantalla "Quién es más probable" */}
      {mainMode === "quienesmasprobable" && !mode && (
        <div className="flex flex-col items-center justify-center text-center gap-4 mt-10 p-6 w-full max-w-[300px]">
          <h2 className="text-3xl font-extrabold text-white mb-4">🤔 Quién es más probable</h2>
          <p className="text-white/90 mb-6">Elige el modo para jugar:</p>

          {/* Botones uno debajo del otro */}
          <button
            className="w-full px-8 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-purple-500 to-pink-500 shadow hover:scale-105 transition-transform"
            onClick={() => setMode("normal")}
          >
            🟣 Normal
          </button>
          <button
            className="w-full px-8 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-red-500 to-orange-500 shadow hover:scale-105 transition-transform"
            onClick={() => setMode("picante")}
          >
            🔥 Picante
          </button>
          <button
            className="w-full px-8 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-green-400 to-emerald-500 shadow hover:scale-105 transition-transform"
            onClick={() => setMode("mix")}
          >
            🌈 Mixto
          </button>

          {/* Botón volver separado */}
          <button
            className="w-full mt-6 px-6 py-3 rounded-xl text-white font-bold bg-gray-700 hover:scale-105 transition-transform"
            onClick={resetMode}
          >
            ⬅️ Volver
          </button>
        </div>
      )}

      {/* Mostrar las frases si ya eligió modo */}
      {mainMode === "quienesmasprobable" && mode && (
        <QuienEsMasProbable mode={mode} resetMode={resetMode} />
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
