import React, { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, updateDoc, arrayUnion, serverTimestamp, doc } from "firebase/firestore";

export default function GrupoForm({ user, onGrupoCreado }) {
  const [nombre, setNombre] = useState("");
  const [frase, setFrase] = useState("");

  const crearGrupo = async () => {
    if (!nombre.trim()) return;
    const grupoRef = await addDoc(collection(db, "fraseGroups"), {
      name: nombre,
      owner: user.uid,
      createdAt: serverTimestamp(),
      frases: []
    });
    onGrupoCreado(grupoRef.id);
    setNombre("");
  };

  const addFraseAGrupo = async (grupoId) => {
    if (!frase.trim()) return;
    const grupoRef = doc(db, "fraseGroups", grupoId);
    await updateDoc(grupoRef, { frases: arrayUnion(frase) });
    setFrase("");
  };

  return (
    <div>
      <input placeholder="Nombre del grupo" value={nombre} onChange={e => setNombre(e.target.value)} />
      <button onClick={crearGrupo}>Crear grupo</button>

      {/* Aquí podrías añadir UI para añadir frases a un grupo específico */}
      <input placeholder="Nueva frase" value={frase} onChange={e => setFrase(e.target.value)} />
      <button onClick={() => addFraseAGrupo(/* id del grupo seleccionado */)}>Añadir frase</button>
    </div>
  );
}
