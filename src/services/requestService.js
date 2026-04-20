import { db } from "./firebase";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  or,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

const createdAtMillis = (createdAt) => {
  if (!createdAt) return 0;
  if (typeof createdAt.toMillis === "function") return createdAt.toMillis();
  if (typeof createdAt.seconds === "number") return createdAt.seconds * 1000;
  if (typeof createdAt === "string") {
    const t = Date.parse(createdAt);
    return Number.isFinite(t) ? t : 0;
  }
  return 0;
};

const sortRequestsNewestFirst = (rows) =>
  [...rows].sort((a, b) => createdAtMillis(b.createdAt) - createdAtMillis(a.createdAt));

/**
 * @param {{ fromUser: string, toUser: string, listingId: string }} data
 * @returns {Promise<string>} new document id
 */
export const sendRequest = async (data) => {
  const { fromUser, toUser, listingId } = data ?? {};
  if (!fromUser || !toUser || !listingId) {
    throw new Error("sendRequest: fromUser, toUser, and listingId are required");
  }

  try {
    const ref = await addDoc(collection(db, "requests"), {
      fromUser,
      toUser,
      listingId,
      status: "pending",
      createdAt: serverTimestamp(),
    });
    return ref.id;
  } catch (error) {
    console.error("Failed to send request", error);
    throw error;
  }
};

/**
 * @param {string} id
 * @param {string} status e.g. "accepted" | "rejected" | "pending"
 */
export const updateRequestStatus = async (id, status) => {
  if (!id) throw new Error("updateRequestStatus: id is required");

  try {
    await updateDoc(doc(db, "requests", id), { status });
  } catch (error) {
    console.error("Failed to update request status", error);
    throw error;
  }
};

/**
 * Real-time requests where the user is sender or receiver.
 * Sorted newest first (client-side).
 * @returns {import("firebase/firestore").Unsubscribe}
 */
export const subscribeRequests = (userId, onNext, onError) => {
  if (!userId) {
    onNext?.([]);
    return () => {};
  }

  const q = query(
    collection(db, "requests"),
    or(where("fromUser", "==", userId), where("toUser", "==", userId))
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const rows = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      onNext?.(sortRequestsNewestFirst(rows));
    },
    (err) => {
      onError?.(err);
    }
  );
};

export const getRequestById = async (requestId) => {
  if (!requestId) return null;

  try {
    const snapshot = await getDoc(doc(db, "requests", requestId));
    if (!snapshot.exists()) return null;

    return {
      id: snapshot.id,
      ...snapshot.data(),
    };
  } catch (error) {
    console.error("Failed to fetch request by id", error);
    throw error;
  }
};
