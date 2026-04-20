import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  where
} from "firebase/firestore";
import { db } from "./firebase";

const reviewsCollection = collection(db, "reviews");

const toReviews = (snapshot) =>
  snapshot.docs.map((docSnapshot) => ({
    id: docSnapshot.id,
    ...docSnapshot.data(),
  }));

const toSummary = (reviews) => {
  const validRatings = (reviews ?? [])
    .map((review) => Number(review?.rating))
    .filter((rating) => Number.isFinite(rating) && rating >= 1 && rating <= 5);

  const count = validRatings.length;
  const averageRating =
    count > 0
      ? Number(
          (validRatings.reduce((sum, rating) => sum + rating, 0) / count).toFixed(1)
        )
      : 0;

  return { averageRating, count };
};

const reviewDocId = (requestId, fromUser) => {
  if (!requestId || !fromUser) {
    throw new Error("reviewDocId: requestId and fromUser are required");
  }

  return `${requestId}_${fromUser}`;
};

export const addReview = async (reviewData) => {
  const fromUser = reviewData?.fromUser;
  const toUser = reviewData?.toUser;
  const requestId = reviewData?.requestId;
  const rating = Number(reviewData?.rating);
  const comment = reviewData?.comment?.trim() ?? "";

  if (!fromUser || !toUser || !requestId || !Number.isFinite(rating)) {
    throw new Error(
      "addReview: fromUser, toUser, requestId, and rating are required"
    );
  }

  if (rating < 1 || rating > 5) {
    throw new Error("addReview: rating must be between 1 and 5");
  }

  try {
    const docId = reviewDocId(requestId, fromUser);
    const reviewRef = doc(db, "reviews", docId);

    await runTransaction(db, async (transaction) => {
      const existing = await transaction.get(reviewRef);
      if (existing.exists()) {
        throw new Error("You already submitted a review for this request.");
      }

      transaction.set(reviewRef, {
        fromUser,
        toUser,
        rating,
        comment,
        requestId,
        listingId: reviewData?.listingId ?? null,
        createdAt: serverTimestamp(),
      });
    });

    return docId;
  } catch (error) {
    console.error("Failed to add review", error);
    throw error;
  }
};

export const getReviewerReviewForRequest = async (fromUser, requestId) => {
  if (!fromUser || !requestId) return null;

  try {
    const reviewRef = doc(db, "reviews", reviewDocId(requestId, fromUser));
    const snapshot = await getDoc(reviewRef);
    if (!snapshot.exists()) return null;

    return {
      id: snapshot.id,
      ...snapshot.data(),
    };
  } catch (error) {
    console.error("Failed to fetch existing reviewer request review", error);
    throw error;
  }
};

export const getUserReviews = async (userId) => {
  if (!userId) return [];

  try {
    const reviewsQuery = query(
      reviewsCollection,
      where("toUser", "==", userId),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(reviewsQuery);
    return toReviews(snapshot);
  } catch (error) {
    console.error("Failed to fetch user reviews", error);
    throw error;
  }
};

export const getUserReviewSummary = async (userId) => {
  try {
    const reviews = await getUserReviews(userId);
    return toSummary(reviews);
  } catch (error) {
    console.error("Failed to compute user review summary", error);
    throw error;
  }
};

export const getUsersReviewSummaries = async (userIds) => {
  const ids = [...new Set((userIds ?? []).filter(Boolean))];

  if (ids.length === 0) return {};

  try {
    const summaries = await Promise.all(
      ids.map(async (id) => [id, await getUserReviewSummary(id)])
    );

    return Object.fromEntries(summaries);
  } catch (error) {
    console.error("Failed to fetch review summaries", error);
    throw error;
  }
};
