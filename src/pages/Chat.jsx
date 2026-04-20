import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useChat } from "../hooks/useChat";
import { createChatId } from "../services/chatService";
import { getUserProfile } from "../services/userService";

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
  const { messages, sendMessage, loading, error } = useChat(chatId);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [otherUserName, setOtherUserName] = useState("Member");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    let cancelled = false;

    const loadOtherUser = async () => {
      if (!otherUserId) return;

      try {
        const profile = await getUserProfile(otherUserId);
        if (!cancelled) {
          setOtherUserName(
            profile?.name || profile?.email || `Member ${otherUserId.slice(0, 6)}`
          );
        }
      } catch (loadError) {
        if (!cancelled) {
          setOtherUserName(`Member ${otherUserId.slice(0, 6)}`);
        }
      }
    };

    loadOtherUser();

    return () => {
      cancelled = true;
    };
  }, [otherUserId]);

  const handleSend = async (event) => {
    event.preventDefault();

    if (!text.trim() || !user?.uid || !chatId || !requestId) return;

    try {
      setSending(true);
      setSendError("");
      await sendMessage({
        senderId: user.uid,
        text,
        requestId,
      });
      setText("");
    } catch (err) {
      setSendError("Unable to send your message right now.");
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
        <div className="flex items-center justify-between gap-4 border-b border-white/10 px-6 py-5">
          <div>
            <Link
              to="/my-requests"
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              ← My requests
            </Link>
            <h1 className="mt-2 text-2xl font-bold">Chat with {otherUserName}</h1>
            <p className="text-sm text-gray-500">Real-time messages unlock after acceptance.</p>
          </div>
          <Link
            to="/dashboard"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10 transition-all"
          >
            Dashboard
          </Link>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
          {loading && (
            <div className="flex justify-center py-12">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-500/20 border-t-cyan-500" />
            </div>
          )}

          {!loading && error && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {!loading && !error && messages.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-12 text-center text-sm text-gray-400">
              No messages yet. Start the conversation.
            </div>
          )}

          {messages.map((message) => {
            const isMine = message?.senderId === user?.uid;

            return (
              <div
                key={message.id}
                className={`flex ${isMine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-3xl px-4 py-3 shadow-lg ${
                    isMine
                      ? "bg-gradient-to-r from-cyan-500/30 to-purple-500/30 border border-cyan-400/20 text-white"
                      : "bg-white/[0.05] border border-white/10 text-gray-100"
                  }`}
                >
                  <p className="text-sm leading-relaxed break-words">{message?.text}</p>
                  <p className="mt-2 text-[11px] text-gray-400">
                    {formatMessageTime(message?.timestamp)}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        <form
          onSubmit={handleSend}
          className="border-t border-white/10 px-6 py-5"
        >
          {sendError && (
            <div className="mb-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {sendError}
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Type your message..."
              className="flex-1 rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-4 text-sm outline-none transition-all focus:border-cyan-500/40"
            />
            <button
              type="submit"
              disabled={sending || !text.trim()}
              className="rounded-2xl bg-gradient-to-r from-[#a855f7] to-[#2dd4bf] px-6 py-4 text-sm font-semibold text-white transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
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
