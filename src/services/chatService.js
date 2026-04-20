import {
  addDoc,
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db } from "./firebase";

const messagesCollection = collection(db, "messages");

export const createChatId = (userA, userB) => {
  const ids = [userA, userB].filter(Boolean).sort();

  if (ids.length !== 2) {
    throw new Error("createChatId: both user IDs are required");
  }

  return ids.join("_");
};

export const sendMessage = async (chatId, messageData) => {
  const senderId = messageData?.senderId;
  const text = messageData?.text?.trim();
  const requestId = messageData?.requestId;

  if (!chatId || !senderId || !text || !requestId) {
    throw new Error(
      "sendMessage: chatId, senderId, text, and requestId are required"
    );
  }

  try {
    const ref = await addDoc(messagesCollection, {
      chatId,
      senderId,
      text,
      requestId,
      timestamp: serverTimestamp(),
    });

    return ref.id;
  } catch (error) {
    console.error("Failed to send message", error);
    throw error;
  }
};

export const subscribeMessages = (chatId, requestId, callback, onError) => {
  if (!chatId || !requestId) {
    callback?.([]);
    return () => {};
  }

  try {
    const messagesQuery = query(
      messagesCollection,
      where("chatId", "==", chatId),
      where("requestId", "==", requestId),
      orderBy("timestamp", "asc"),
      limit(150)
    );

    return onSnapshot(
      messagesQuery,
      (snapshot) => {
        const messages = snapshot.docs.map((docSnapshot) => ({
          id: docSnapshot.id,
          ...docSnapshot.data(),
        }));

        callback?.(messages);
      },
      (error) => {
        console.error("Failed to subscribe to messages", error);
        onError?.(error);
      }
    );
  } catch (error) {
    console.error("Failed to create messages subscription", error);
    onError?.(error);
    return () => {};
  }
};
