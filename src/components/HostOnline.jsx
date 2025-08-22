import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { doc, setDoc, updateDoc, onSnapshot, serverTimestamp, arrayUnion } from "firebase/firestore";

export default function HostOnline({ setPartidaId, resetMode }) {
  const [creating, setCreating] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [inputPhrase, setInputPhrase] = useState("");
  const [frases, setFrases] = useState([]);
  const [started, setStarted] = useState(false);
  const [localId, setLocalId] = useState("");

  useEffect(() => {
    if (!localId) return;
    const partidaRef = doc(db, "partidas", localId);
    const unsubscribe = onSnapshot(partidaRef, (snapshot) => {
      const data = snapshot.data();
      if (!data) return;
      setFrases(data.frases || []);
    });
    return () => unsubscribe();
  }, [localId]);

  const crearPartida = async () => {
    setCreating(true);
    const newId = Math.random().toString(36).substring(2, 10);
    setLocalId(newId);
    const partidaRef = doc(db, "partidas", newId);
    await setDoc(partidaRef, { frases: [], ultimaFrase: serverTimestamp() });
    setCreating(false);
  };

  const addPhrase = async () => {
    const newPhrase = inputPhrase.trim();
    if (!newPhrase) return;
    if (frases.some(f => f.toLowerCase().trim() === newPhrase.toLowerCase())) {
      alert("Esa frase ya ha sido añadida");
      return;
    }
    const partidaRef = doc(db, "partidas", localId);
    await updateDoc(partidaRef, { frases: arrayUnion(newPhrase) });
    setInputPhrase("");
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/online/${localId}`);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const startGame = () => {
    setStarted(true);
    setPartidaId(localId);
  };

  const inputStyle = {
    width: "100%",
    padding: "10px",
    borderRadius: "10px",
    marginBottom: "10px",
    border: "1px solid #ccc",
    background: "transparent",
    color: "#fff",
  };

  const buttonStyle = {
    padding: "10px 20px",
    borderRadius: "12px",
    cursor: "pointer",
    border: "none",
    background: "#4f46e5",
    color: "#fff",
    fontWeight: "bold"
  };

  const smallButtonStyle = {
    padding: "8px 12px",
    borderRadius: "8px",
    cursor: "pointer",
    border: "none",
    background: "#10b981",
    color: "#fff",
    fontWeight: "bold",
    marginLeft: "5px"
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "400px", margin: "0 auto", textAlign: "center" }}>
      {!localId && (
        <button onClick={crearPartida} disabled={creating} style={buttonStyle}>
          {creating ? "Creando partida..." : "Crear partida online"}
        </button>
      )}

      {localId && !started && (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <label style={{ color: "#fff" }}>Enlace de la partida:</label>
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <input type="text" readOnly value={`${window.location.origin}/online/${localId}`} style={inputStyle} />
              <button onClick={copyLink} style={smallButtonStyle}>
                {linkCopied ? "✓" : "📋"}
              </button>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <label style={{ color: "#fff" }}>Añadir frases:</label>
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <input
                type="text"
                placeholder="Escribe un 'Yo nunca...'"
                value={inputPhrase}
                onChange={(e) => setInputPhrase(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") addPhrase(); }}
                style={inputStyle}
              />
              <button onClick={addPhrase} style={smallButtonStyle}>+</button>
            </div>
          </div>

          <button onClick={startGame} style={buttonStyle}>
            Comenzar partida
          </button>
        </>
      )}
    </div>
  );
}
