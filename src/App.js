import React, { useState } from "react";
import ModeSelector from "./components/ModeSelector";
import Game from "./components/Game";
import phrases from "./data/phrases.json";
import "./index.css";

function App() {
  const [mode, setMode] = useState(null);

  const resetMode = () => setMode(null);

  const getPhrasesForMode = () => {
    if (mode === "mix") {
      return [...phrases.normal, ...phrases.hot];
    }
    return phrases[mode];
  };

  return (
    <div className="app">
      <h1>Yo Nunca</h1>

      {!mode && <ModeSelector setMode={setMode} />}

      {mode && (
        <>
          <Game mode={mode} phrases={getPhrasesForMode()} />
          <button className="back-button" onClick={resetMode}>
            ← Volver a elegir modo
          </button>
        </>
      )}
    </div>
  );
}

export default App;
