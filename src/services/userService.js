import { db } from "./firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

export const saveUserProfile = async (userId, data) => {
  if (!userId) throw new Error("saveUserProfile: userId is required");

  try {
    const userRef = doc(db, "users", userId);
    await setDoc(userRef, data, { merge: true });
  } catch (error) {
    console.error("Failed to save user profile", error);
    throw error;
  }
};

export const getUserProfile = async (userId) => {
  if (!userId) return null;

  try {
    const userRef = doc(db, "users", userId);
    const snapshot = await getDoc(userRef);

    if (snapshot.exists()) {
      return snapshot.data();
    }

    return null;
  } catch (error) {
    console.error("Failed to fetch user profile", error);
    throw error;
  }
};

export const getUserProfilesByIds = async (userIds) => {
  const ids = [...new Set((userIds ?? []).filter(Boolean))];

  if (ids.length === 0) return {};

  try {
    const profiles = await Promise.all(
      ids.map(async (id) => {
        const data = await getUserProfile(id);
        return [id, data];
      })
    );

    return Object.fromEntries(profiles);
  } catch (error) {
    console.error("Failed to fetch user profiles", error);
    throw error;
  }
};
