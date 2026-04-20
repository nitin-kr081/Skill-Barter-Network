import { useCallback, useEffect, useState } from "react";
import { sendMessage as sendChatMessage, subscribeMessages } from "../services/chatService";

export const useChat = (chatId) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");

    const unsubscribe = subscribeMessages(
      chatId,
      (rows) => {
        setMessages(Array.isArray(rows) ? rows : []);
        setLoading(false);
      },
      () => {
        setMessages([]);
        setError("Failed to load chat messages.");
        setLoading(false);
      }
    );

    return () => unsubscribe?.();
  }, [chatId]);

  const sendMessage = useCallback(
    async (messageData) => {
      try {
        setError("");
        return await sendChatMessage(chatId, messageData);
      } catch (err) {
        setError("Failed to send message.");
        throw err;
      }
    },
    [chatId]
  );

  return { messages, sendMessage, loading, error };
};
