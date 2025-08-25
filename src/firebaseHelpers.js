import { collection, query, where, getDocs, addDoc, updateDoc, doc, arrayUnion, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export const getMisGrupos = async (uid) => {
  const q = query(collection(db, "fraseGroups"), where("owner", "==", uid));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const crearGrupo = async (uid, nombre) => {
  const grupoRef = await addDoc(collection(db, "fraseGroups"), {
    name: nombre,
    owner: uid,
    createdAt: serverTimestamp(),
    frases: []
  });
  return grupoRef.id;
};

export const addFraseAGrupo = async (grupoId, frase) => {
  const grupoRef = doc(db, "fraseGroups", grupoId);
  await updateDoc(grupoRef, { frases: arrayUnion(frase) });
};
