import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useChat } from "../hooks/useChat";
import { createChatId } from "../services/chatService";
import { getUserProfile } from "../services/userService";
import { getRequestById } from "../services/requestService";

const formatMessageTime = (value) => {
  const date =
    typeof value?.toDate === "function"
      ? value.toDate()
      : value
      ? new Date(value)
      : null;

  if (!date || Number.isNaN(date.getTime())) {
    return "Sending...";
  }

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const Chat = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const otherUserId = searchParams.get("userId");
  const rawChatId = searchParams.get("chatId");
  const requestId = searchParams.get("requestId");

  const chatId = useMemo(() => {
    if (rawChatId) return rawChatId;
    if (!user?.uid || !otherUserId) return "";

    try {
      return createChatId(user.uid, otherUserId);
    } catch {
      return "";
    }
  }, [otherUserId, rawChatId, user?.uid]);

  const { messages, sendMessage, loading, error } = useChat(chatId, requestId);

  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [otherUserName, setOtherUserName] = useState("");
  const [isRequestValid, setIsRequestValid] = useState(true);
  const [requestError, setRequestError] = useState("");
  const [optimisticMessages, setOptimisticMessages] = useState([]);

  const bottomRef = useRef(null);

  // ✅ FIXED: prevent duplicate messages
  const displayedMessages = useMemo(() => {
    const realKeys = new Set(
      messages.map((m) => `${m.text}_${m.senderId}`)
    );

    const filteredOptimistic = optimisticMessages.filter(
      (msg) => !realKeys.has(`${msg.text}_${msg.senderId}`)
    );

    return [...messages, ...filteredOptimistic];
  }, [messages, optimisticMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayedMessages]);

  // Load other user name
  // useEffect(() => {
  //   let cancelled = false;

  //   const loadOtherUser = async () => {
  //     if (!otherUserId) return;

  //     try {
  //       const profile = await getUserProfile(otherUserId);
  //       if (!cancelled) {
  //         setOtherUserName(
  //           profile?.displayName || profile?.name || "Community member"
  //         );
  //       }
  //     } catch {
  //       if (!cancelled) {
  //         setOtherUserName("Community member");
  //       }
  //     }
  //   };

  //   loadOtherUser();

  //   return () => {
  //     cancelled = true;
  //   };
  // }, [otherUserId]);
  useEffect(() => {
  let cancelled = false;

  const loadOtherUser = async () => {
    if (!otherUserId) return;

    try {
      const profile = await getUserProfile(otherUserId);
      if (!cancelled) {
        setOtherUserName(
          profile?.name || "Community member"
        );
      }
    } catch {
      if (!cancelled) {
        setOtherUserName("");
      }
    }
  };

  loadOtherUser();

  return () => {
    cancelled = true;
  };
}, [otherUserId]);

  // Validate request
  useEffect(() => {
    let cancelled = false;

    const validateRequest = async () => {
      if (!requestId || !user?.uid) {
        setRequestError("Missing request context.");
        setIsRequestValid(false);
        return;
      }

      try {
        const request = await getRequestById(requestId);

        const isParticipant =
          request?.fromUser === user.uid || request?.toUser === user.uid;

        const validStatus =
          request?.status === "accepted" || request?.status === "completed";

        if (!cancelled) {
          if (!request || !isParticipant || !validStatus) {
            setRequestError("Chat is unavailable for this request.");
            setIsRequestValid(false);
          } else {
            setRequestError("");
            setIsRequestValid(true);
          }
        }
      } catch {
        if (!cancelled) {
          setRequestError("");
          setIsRequestValid(true);
        }
      }
    };

    validateRequest();

    return () => {
      cancelled = true;
    };
  }, [requestId, user?.uid]);

  const handleSend = async (event) => {
    event.preventDefault();

    const textValue = text.trim();
    if (!textValue || !user?.uid || !chatId || !requestId || !isRequestValid)
      return;

    let tempId = "";

    try {
      tempId = `temp-${Date.now()}`;
      setSending(true);
      setSendError("");
      setText("");

      // optimistic UI
      setOptimisticMessages((prev) => [
        ...prev,
        {
          id: tempId,
          senderId: user.uid,
          text: textValue,
          timestamp: new Date(),
        },
      ]);

      await sendMessage({
        senderId: user.uid,
        text: textValue,
      });

      // remove optimistic after real message comes
      setOptimisticMessages((prev) =>
        prev.filter((msg) => msg.id !== tempId)
      );
    } catch (err) {
      console.error(err);
      setSendError("Unable to send your message right now.");
      setText((prev) => (prev ? prev : textValue));

      setOptimisticMessages((prev) =>
        prev.filter((msg) => msg.id !== tempId)
      );
    } finally {
      setSending(false);
    }
  };

  if (!chatId || !requestId) {
    return (
      <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center p-6">
        <div className="w-full max-w-lg rounded-[32px] border border-white/10 bg-white/[0.03] p-8 text-center">
          <h1 className="text-2xl font-bold">Chat unavailable</h1>
          <p className="mt-3 text-sm text-gray-400">
            Open chat from an accepted request to start messaging.
          </p>
          <Link
            to="/my-requests"
            className="mt-6 inline-flex rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm hover:bg-white/10 transition-all"
          >
            Back to requests
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 md:p-10 font-sans">
      <div className="mx-auto flex max-w-4xl flex-col rounded-[32px] border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-xl min-h-[80vh]">

        {/* Header */}
        <div className="flex items-center justify-between gap-4 border-b border-white/10 px-6 py-5">
          <div>
            <Link to="/my-requests" className="text-xs text-gray-500 hover:text-gray-300">
              ← My requests
            </Link>

            <h1 className="mt-2 text-2xl font-bold">
              {otherUserName ? `Chat with ${otherUserName}` : "Chat"}
            </h1>

            {otherUserId && (
              <Link
                to={`/user/${encodeURIComponent(otherUserId)}`}
                className="mt-2 inline-block text-xs text-cyan-300 hover:text-cyan-200"
              >
                View Profile
              </Link>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {!loading && displayedMessages.length === 0 && (
            <div className="text-center text-gray-400">
              Start conversation
            </div>
          )}

          <div className="space-y-2">
            {displayedMessages.map((msg) => {
              const isMine = msg.senderId === user?.uid;

              return (
                <div
                  key={msg.id}
                  className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                >
                  <div className="max-w-[80%] rounded-xl px-4 py-2 bg-white/10">
                    <p>{msg.text}</p>
                    <p className="text-xs text-gray-400">
                      {formatMessageTime(msg.timestamp)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="border-t border-white/10 px-6 py-4">
          {sendError && <p className="text-red-400 text-sm mb-2">{sendError}</p>}

          <div className="flex gap-3">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 rounded-xl px-4 py-2 bg-white/10 outline-none"
            />

            <button
              type="submit"
              disabled={sending || !text.trim()}
              className="px-5 py-2 bg-cyan-500 rounded-xl"
            >
              {sending ? "Sending..." : "Send"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Chat;