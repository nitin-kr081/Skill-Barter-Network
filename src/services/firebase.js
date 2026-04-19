import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAoMKvxLsCe4loHlujVljTEIy6bKEYm2NA",
  authDomain: "skill-barter-network-00.firebaseapp.com",
  projectId: "skill-barter-network-00",
  storageBucket: "skill-barter-network-00.firebasestorage.app",
  messagingSenderId: "390256558435",
  appId: "1:390256558435:web:95465057e78e6e816a9356"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);