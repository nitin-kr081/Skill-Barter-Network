import { db } from "./firebase";
import { 
  collection, 
  addDoc, 
  getDocs, 
  serverTimestamp, 
  doc, 
  deleteDoc 
} from "firebase/firestore";


export const createListing = async (data) => {
  const listingsRef = collection(db, "listings");

  return await addDoc(listingsRef, {
    ...data,
    createdAt: serverTimestamp(),
  });
};

export const getListings = async () => {
  const getRef = await getDocs(collection(db, "listings"));

  return getRef.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

export const deleteListing = async (id) => {
  await deleteDoc(doc(db, "listings", id));
};