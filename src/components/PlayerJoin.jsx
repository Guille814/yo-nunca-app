import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { doc, updateDoc, onSnapshot, arrayUnion } from "firebase/firestore";

export default function PlayerJoin({ partidaId }) {
  const [inputPhrase, setInputPhrase] = useState("");
  const [frases, setFrases] = useState([]);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    if (!partidaId) return;
    const partidaRef = doc(db, "partidas", partidaId);

    const unsubscribe = onSnapshot(partidaRef, (snapshot) => {
      const data = snapshot.data();
      if (!data) return;
      setFrases(data.frases || []);
    });

    return () => unsubscribe();
  }, [partidaId]);

  const addPhrase = async () => {
    if (!inputPhrase.trim()) return;
    const partidaRef = doc(db, "partidas", partidaId);
    await updateDoc(partidaRef, {
      frases: arrayUnion(inputPhrase)
    });
    setInputPhrase("");
  };

  const joinGame = () => setJoined(true);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "400px", margin: "0 auto", textAlign: "center" }}>
      {!joined ? (
        <button onClick={joinGame} style={{ padding: "12px 20px", borderRadius: "12px", cursor: "pointer" }}>
          Unirse a la partida
        </button>
      ) : (
        <>
          <p>Frases totales en la partida: {frases.length}</p>

          <div>
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

          <div>
            <h3>Frases actuales:</h3>
            <ul style={{ textAlign: "left", maxHeight: "150px", overflowY: "auto", padding: "0 10px" }}>
              {frases.map((f, i) => <li key={i} style={{ marginBottom: "5px" }}>{f}</li>)}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
