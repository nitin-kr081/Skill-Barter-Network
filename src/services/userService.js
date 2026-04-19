import {db} from '../services/firebase';
import { doc, setDoc, getDoc, deleteDoc} from "firebase/firestore";

export const saveUserProfile = async (userId, data) =>{
    const userRef = doc(db, "users", userId);
    await setDoc(userRef, data, {merge: true});
}

export const getUserProfile = async (userId) => {
  const userRef = doc(db, "users", userId);
  const snapshot = await getDoc(userRef);

  if (snapshot.exists()) {
    return snapshot.data();
  } else {
    return null;
  }
};
