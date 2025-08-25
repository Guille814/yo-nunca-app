import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  doc, setDoc, updateDoc, onSnapshot, getDoc, serverTimestamp, arrayUnion,
  collection, query, where, getDocs
} from "firebase/firestore";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

export default function HostOnline({ setPartidaId, resetMode }) {
  const [creating, setCreating] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [inputPhrase, setInputPhrase] = useState("");
  const [frasesSesion, setFrasesSesion] = useState([]); // Frases añadidas a la sesión
  const [started, setStarted] = useState(false);
  const [localId, setLocalId] = useState("");
  const [user, setUser] = useState(null);

  const [misGrupos, setMisGrupos] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [nuevoGrupo, setNuevoGrupo] = useState("");
  const [nuevoInputGrupo, setNuevoInputGrupo] = useState({}); // inputs independientes por grupo

  const auth = getAuth();

  // Cargar frases en tiempo real de la partida
  useEffect(() => {
    if (!localId) return;
    const partidaRef = doc(db, "partidas", localId);
    const unsubscribe = onSnapshot(partidaRef, (snapshot) => {
      const data = snapshot.data();
      if (!data) return;
      setFrasesSesion(data.frases || []);
    });
    return () => unsubscribe();
  }, [localId]);

  // Cargar grupos del usuario
  useEffect(() => {
    if (!user) return;
    const getMisGrupos = async () => {
      const q = query(collection(db, "fraseGroups"), where("owner", "==", user.uid));
      const querySnapshot = await getDocs(q);
      const grupos = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMisGrupos(grupos);
    };
    getMisGrupos();
  }, [user]);

  const crearPartida = async (userId = null) => {
    setCreating(true);
    const newId = Math.random().toString(36).substring(2, 10);
    setLocalId(newId);
    const partidaRef = doc(db, "partidas", newId);
    await setDoc(partidaRef, { frases: [], ultimaFrase: serverTimestamp(), owner: userId });
    setCreating(false);
  };

  const entrarComoInvitado = async () => {
    await crearPartida();
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
      if (!localId) await crearPartida(result.user.uid);
    } catch (error) {
      console.error("Error al iniciar sesión con Google:", error);
    }
  };

  const addPhrase = async () => {
    const newPhrase = inputPhrase.trim();
    if (!newPhrase) return;

    if (frasesSesion.some(f => f.toLowerCase().trim() === newPhrase.toLowerCase())) {
      alert("Esa frase ya ha sido añadida a la sesión");
      return;
    }

    const partidaRef = doc(db, "partidas", localId);
    await updateDoc(partidaRef, { frases: arrayUnion(newPhrase) });
    setInputPhrase("");
  };

  const addPhraseToGroup = async (grupoId) => {
    const newPhrase = (nuevoInputGrupo[grupoId] || "").trim();
    if (!newPhrase) return;

    const grupoRef = doc(db, "fraseGroups", grupoId);
    const grupoSnap = await getDoc(grupoRef);

    if (grupoSnap.exists()) {
      const grupoData = grupoSnap.data();
      if (grupoData.frases.map(f => f.toLowerCase().trim()).includes(newPhrase.toLowerCase().trim())) {
        alert("La frase ya existe en este grupo");
        return;
      }
      await updateDoc(grupoRef, { frases: arrayUnion(newPhrase) });
      setNuevoInputGrupo(prev => ({ ...prev, [grupoId]: "" }));

      // Recargar grupos
      const q = query(collection(db, "fraseGroups"), where("owner", "==", user.uid));
      const querySnapshot = await getDocs(q);
      const grupos = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMisGrupos(grupos);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/online/${localId}`);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const toggleGrupoSeleccionado = (id) => {
    setSelectedGroups(prev =>
      prev.includes(id) ? prev.filter(gid => gid !== id) : [...prev, id]
    );
  };

  const crearGrupo = async () => {
    const name = nuevoGrupo.trim();
    if (!name || !user) return;

    const grupoRef = doc(db, "fraseGroups", Math.random().toString(36).substring(2, 10));
    await setDoc(grupoRef, { name, frases: [], owner: user.uid });
    setNuevoGrupo("");

    // Recargar grupos
    const q = query(collection(db, "fraseGroups"), where("owner", "==", user.uid));
    const querySnapshot = await getDocs(q);
    const grupos = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setMisGrupos(grupos);
  };

  const startGameConGrupos = async () => {
    // Solo coger frases de los grupos seleccionados + frases de la sesión
    let allFrases = [...frasesSesion];

    for (const gid of selectedGroups) {
      const docRef = doc(db, "fraseGroups", gid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        allFrases.push(...docSnap.data().frases);
      }
    }

    // Eliminar duplicados (ignorando mayúsculas y espacios)
    allFrases = Array.from(new Set(allFrases.map(f => f.toLowerCase().trim())));

    if (allFrases.length === 0) {
      alert("No hay frases disponibles para la partida");
      return;
    }

    const partidaRef = doc(db, "partidas", localId);
    await updateDoc(partidaRef, { frases: allFrases, selectedGroups });

    setStarted(true);
    setPartidaId(localId);
  };

  const inputStyle = { width: "100%", padding: "10px", borderRadius: "10px", marginBottom: "10px", border: "1px solid #ccc", background: "transparent", color: "#fff" };
  const buttonStyle = { padding: "10px 20px", borderRadius: "12px", cursor: "pointer", border: "none", background: "#4f46e5", color: "#fff", fontWeight: "bold" };
  const smallButtonStyle = { padding: "8px 12px", borderRadius: "8px", cursor: "pointer", border: "none", background: "#10b981", color: "#fff", fontWeight: "bold", marginLeft: "5px" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "500px", margin: "0 auto", textAlign: "center" }}>

      {/* Usuario */}
      {user && (
        <div style={{ display: "flex", alignItems: "center", gap: "10px", justifyContent: "center", marginBottom: "20px" }}>
          {user.photoURL && <img src={user.photoURL} alt="Avatar" style={{ width: "30px", height: "30px", borderRadius: "50%" }} />}
          <span style={{ color: "#fff", fontWeight: "bold" }}>Conectado como {user.displayName || user.email}</span>
        </div>
      )}

      {/* Entrar como invitado / Google */}
      {!localId && !user && (
        <>
          <button onClick={entrarComoInvitado} disabled={creating} style={buttonStyle}>
            {creating ? "Creando partida..." : "Entrar como invitado"}
          </button>
          <button onClick={loginWithGoogle} style={{ ...buttonStyle, background: "#fff", color: "#000", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.33 1.52 7.77 2.8l5.7-5.7C34.05 3.2 29.74 1 24 1 14.98 1 7.02 7.48 4.69 16H12.9c1.34-4.3 5.36-7.5 11.1-7.5z" />
              <path fill="#4285F4" d="M46.5 24c0-1.57-.14-3.08-.39-4.5H24v9h12.73c-.55 3-2.4 5.57-5.15 7.27l5.7 5.7C43.84 36.4 46.5 30.6 46.5 24z" />
              <path fill="#FBBC05" d="M12.9 32c-1.26-2.1-2-4.53-2-7s.74-4.9 2-7l-8.2-6.4C1.7 18.3 1 21.97 1 24s.7 5.7 3.7 9.8l8.2-6.8z" />
              <path fill="#34A853" d="M24 46c6.3 0 11.7-2.1 15.6-5.7l-7.3-5.7c-2 1.3-4.8 2.1-8.3 2.1-5.7 0-10.7-3.2-12.3-7.8L4.7 32.2C7 40.5 14.9 46 24 46z" />
              <path fill="none" d="M0 0h48v48H0z" />
            </svg>
            Iniciar sesión con Google
          </button>
        </>
      )}

      {/* Partida creada */}
      {localId && !started && (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <label style={{ color: "#fff" }}>Enlace de la partida:</label>
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <input type="text" readOnly value={`${window.location.origin}/online/${localId}`} style={inputStyle} />
              <button onClick={copyLink} style={smallButtonStyle}>{linkCopied ? "✓" : "📋"}</button>
            </div>
          </div>

          {/* Grupos */}
          {user && misGrupos.length > 0 && (
            <div style={{ marginTop: "20px" }}>
              <label style={{ color: "#fff", fontWeight: "bold", marginBottom: "10px", display: "block" }}>Mis grupos:</label>
              <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                {misGrupos.map(grupo => (
                  <div key={grupo.id} className="grupo-card">
                    <div className="grupo-info">
                      <input
                        type="checkbox"
                        checked={selectedGroups.includes(grupo.id)}
                        onChange={() => toggleGrupoSeleccionado(grupo.id)}
                      />
                      <span className="grupo-name">{grupo.name}</span>
                    </div>

                    <div className="grupo-actions">
                      <input
                        type="text"
                        placeholder="Añadir frase al grupo"
                        value={nuevoInputGrupo[grupo.id] || ""}
                        onChange={e => setNuevoInputGrupo(prev => ({ ...prev, [grupo.id]: e.target.value }))}
                        onKeyDown={e => { if (e.key === "Enter") addPhraseToGroup(grupo.id) }}
                      />
                      <button onClick={() => addPhraseToGroup(grupo.id)}>+</button>
                      <button onClick={async () => {
                        const grupoRef = doc(db, "fraseGroups", grupo.id);
                        await updateDoc(grupoRef, { deleted: true });
                        setMisGrupos(prev => prev.filter(g => g.id !== grupo.id));
                      }}>🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Nuevo grupo */}
          {user && (
            <div style={{ display: "flex", gap: "5px", marginTop: "10px" }}>
              <input
                type="text"
                placeholder="Nombre del grupo"
                value={nuevoGrupo}
                onChange={e => setNuevoGrupo(e.target.value)}
                style={{ flex: 1, padding: "8px", borderRadius: "8px", border: "1px solid #ccc" }}
              />
              <button onClick={crearGrupo} style={smallButtonStyle}>Crear grupo</button>
            </div>
          )}

          {/* Frases de la sesión */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "10px" }}>
            <label style={{ color: "#fff" }}>Añadir frases a la sesión:</label>
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

          <button onClick={startGameConGrupos} style={buttonStyle}>
            Comenzar partida
          </button>
        </>
      )}
    </div>
  );
}
