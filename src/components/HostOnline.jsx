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

  // Escuchar cambios en Firestore
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

    // Evitar frases repetidas
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
    setPartidaId(localId); // Avisamos a App que host empieza la partida
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "400px", margin: "0 auto", textAlign: "center" }}>
      {!localId && (
        <button onClick={crearPartida} disabled={creating} style={{ padding: "12px 20px", borderRadius: "12px", cursor: "pointer" }}>
          {creating ? "Creando partida..." : "Crear partida online"}
        </button>
      )}

      {localId && !started && (
        <>
          <div>
            <p>Enlace de la partida:</p>
            <input type="text" readOnly value={`${window.location.origin}/online/${localId}`} style={{ width: "100%", padding: "10px", borderRadius: "10px", marginBottom: "10px" }} />
            <button onClick={copyLink} style={{ padding: "10px 20px", borderRadius: "10px", cursor: "pointer" }}>
              {linkCopied ? "¡Copiado!" : "Copiar enlace"}
            </button>
          </div>

          <div>
            <p>Añadir frases:</p>
            <input
              type="text"
              placeholder="Escribe un 'Yo nunca...'"
              value={inputPhrase}
              onChange={(e) => setInputPhrase(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") addPhrase(); }}
              style={{ width: "100%", padding: "10px", borderRadius: "10px", marginBottom: "10px" }}
            />
            <button onClick={addPhrase} style={{ padding: "10px 20px", borderRadius: "10px", cursor: "pointer" }}>Añadir frase</button>
          </div>

          <button onClick={startGame} style={{ padding: "12px 20px", borderRadius: "12px", cursor: "pointer" }}>
            Comenzar partida
          </button>

          <button className="back-button" onClick={resetMode} style={{ marginTop: "20px" }}>← Volver a elegir modo</button>
        </>
      )}
    </div>
  );
}
