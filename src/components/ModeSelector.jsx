import React from "react";

export default function ModeSelector({ setMode }) {
  return (
    <div className="mode-selector">
      <button onClick={() => setMode("normal")}>Modo Normal</button>
      <button onClick={() => setMode("hot")}>Modo Hot 🔥</button>
    </div>
  );
}
