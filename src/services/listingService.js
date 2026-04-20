import { db } from "./firebase";
import {
  collection,
  addDoc,
  Timestamp,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  deleteDoc,
  updateDoc,
  limit,
} from "firebase/firestore";

export const createListing = async (data) => {
  const listingsRef = collection(db, "listings");

  try {
    return await addDoc(listingsRef, {
      ...data,
      status: data?.status ?? "open",
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Failed to create listing", error);
    throw error;
  }
};

const listingsNewestFirstQuery = () =>
  query(
    collection(db, "listings"),
    orderBy("createdAt", "desc"),
    limit(120)
  );

const mapSnapshotToListings = (snapshot) =>
  snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));

/** Real-time listings (newest first). Returns Firestore unsubscribe. */
export const subscribeListings = (onNext, onError) => {
  const q = listingsNewestFirstQuery();
  return onSnapshot(
    q,
    (snapshot) => {
      onNext(mapSnapshotToListings(snapshot));
    },
    (err) => {
      if (onError) onError(err);
    }
  );
};

export const deleteListing = async (id) => {
  try {
    await deleteDoc(doc(db, "listings", id));
  } catch (error) {
    console.error("Failed to delete listing", error);
    throw error;
  }
};

export const updateListingStatus = async (id, status, closedByRequestId) => {
  if (!id || !status) {
    throw new Error("updateListingStatus: id and status are required");
  }

  try {
    const payload = { status };
    if (status === "closed") {
      payload.closedByRequestId = closedByRequestId ?? null;
      payload.closedAt = Timestamp.now();
    }
    await updateDoc(doc(db, "listings", id), payload);
  } catch (error) {
    console.error("Failed to update listing status", error);
    throw error;
  }
};