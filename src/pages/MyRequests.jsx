import { useCallback, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useListings } from "../hooks/useListings";
import { useRequests } from "../hooks/useRequests";
import { updateRequestStatus } from "../services/requestService";
import { createChatId } from "../services/chatService";

const listingsById = (listings) => {
  const map = new Map();
  (listings ?? []).forEach((l) => {
    if (l?.id) map.set(l.id, l);
  });
  return map;
};

const statusStyles = (status) => {
  const s = String(status ?? "").toLowerCase();
  if (s === "accepted")
    return "border-emerald-500/25 bg-emerald-500/10 text-emerald-300";
  if (s === "rejected")
    return "border-red-500/25 bg-red-500/10 text-red-300";
  return "border-amber-500/25 bg-amber-500/10 text-amber-200";
};

const RequestRow = ({
  row,
  userId,
  listing,
  updatingId,
  onAccept,
  onReject,
  onOpenChat,
  onLeaveReview,
}) => {
  const isIncoming = row?.toUser === userId;
  const isOutgoing = row?.fromUser === userId;
  const canRespond =
    isIncoming && String(row?.status).toLowerCase() === "pending";
  const isAccepted = String(row?.status).toLowerCase() === "accepted";
  const otherUserId = isOutgoing ? row?.toUser : row?.fromUser;

  return (
    <div className="rounded-[28px] border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 md:p-8 shadow-xl">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">
            {isIncoming ? "Received" : isOutgoing ? "Sent" : "Request"}
          </p>
          <h3 className="text-xl font-bold text-white">
            {listing?.title ?? "Listing"}
          </h3>
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
            {listing?.description ?? "Listing details load from the feed."}
          </p>
        </div>
        <span
          className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold capitalize ${statusStyles(row?.status)}`}
        >
          {row?.status ?? "unknown"}
        </span>
      </div>

      <div className="flex flex-wrap gap-3 text-xs text-gray-500">
        <span>Listing ID: {row?.listingId}</span>
        {isOutgoing && <span>To user: {row?.toUser}</span>}
        {isIncoming && <span>From user: {row?.fromUser}</span>}
      </div>

      {canRespond && (
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            disabled={updatingId === row.id}
            onClick={() => onAccept(row.id)}
            className="px-5 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-200 text-sm font-semibold hover:bg-emerald-500/30 transition-all disabled:opacity-50"
          >
            {updatingId === row.id ? "Updating…" : "Accept"}
          </button>
          <button
            type="button"
            disabled={updatingId === row.id}
            onClick={() => onReject(row.id)}
            className="px-5 py-2.5 rounded-xl bg-red-500/15 border border-red-500/25 text-red-200 text-sm font-semibold hover:bg-red-500/25 transition-all disabled:opacity-50"
          >
            Reject
          </button>
        </div>
      )}

      {isAccepted && otherUserId && (
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => onOpenChat(otherUserId, row?.id)}
            className="px-5 py-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/25 text-cyan-200 text-sm font-semibold hover:bg-cyan-500/20 transition-all"
          >
            Chat
          </button>
          <button
            type="button"
            onClick={() => onLeaveReview(row?.id)}
            className="px-5 py-2.5 rounded-xl bg-purple-500/10 border border-purple-500/25 text-purple-200 text-sm font-semibold hover:bg-purple-500/20 transition-all"
          >
            Leave Review
          </button>
        </div>
      )}
    </div>
  );
};

const MyRequests = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { listings, loading: listingsLoading } = useListings();
  const { requests, loading: requestsLoading, dispatch } = useRequests(
    user?.uid
  );
  const [updatingId, setUpdatingId] = useState(null);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  const listingMap = useMemo(() => listingsById(listings), [listings]);

  const handleAccept = useCallback(
    async (id) => {
      try {
        setActionError("");
        setActionSuccess("");
        setUpdatingId(id);
        await updateRequestStatus(id, "accepted");
        dispatch({
          type: "UPDATE_REQUEST",
          payload: { id, updates: { status: "accepted" } },
        });
        setActionSuccess("Request accepted. Chat is now available.");
      } catch (err) {
        console.error(err);
        setActionError("Could not accept this request.");
      } finally {
        setUpdatingId(null);
      }
    },
    [dispatch]
  );

  const handleReject = useCallback(
    async (id) => {
      try {
        setActionError("");
        setActionSuccess("");
        setUpdatingId(id);
        await updateRequestStatus(id, "rejected");
        dispatch({
          type: "UPDATE_REQUEST",
          payload: { id, updates: { status: "rejected" } },
        });
        setActionSuccess("Request rejected.");
      } catch (err) {
        console.error(err);
        setActionError("Could not reject this request.");
      } finally {
        setUpdatingId(null);
      }
    },
    [dispatch]
  );

  const handleOpenChat = useCallback(
    (otherUserId, requestId) => {
      if (!user?.uid || !otherUserId || !requestId) return;

      const chatId = createChatId(user.uid, otherUserId);
      navigate(
        `/chat?chatId=${encodeURIComponent(chatId)}&userId=${encodeURIComponent(otherUserId)}&requestId=${encodeURIComponent(requestId)}`
      );
    },
    [navigate, user?.uid]
  );

  const handleLeaveReview = useCallback(
    (requestId) => {
      if (!requestId) return;
      navigate(`/reviews?requestId=${encodeURIComponent(requestId)}`);
    },
    [navigate]
  );

  const pageLoading = listingsLoading || requestsLoading;

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 md:p-12 relative overflow-hidden font-sans">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-cyan-500/10 blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
          <div>
            <Link
              to="/listings"
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors mb-2 inline-block"
            >
              ← Feed
            </Link>
            <h1 className="text-3xl font-bold tracking-tight">My requests</h1>
            <p className="text-gray-500 text-sm mt-1">
              Incoming and outgoing interest for your listings.
            </p>
          </div>
          <Link
            to="/dashboard"
            className="px-5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm hover:bg-white/10 transition-all"
          >
            Dashboard
          </Link>
        </div>

        {actionError && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {actionError}
          </div>
        )}

        {actionSuccess && (
          <div className="mb-6 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-300">
            {actionSuccess}
          </div>
        )}

        {requests.length === 0 && (
          <div className="text-center py-20 rounded-[32px] border border-white/5 bg-white/[0.02] backdrop-blur-xl">
            <p className="text-gray-500 text-lg">No requests</p>
          </div>
        )}

        <div className="space-y-5">
          {requests.map((row) => (
            <RequestRow
              key={row.id}
              row={row}
              userId={user?.uid}
              listing={listingMap.get(row?.listingId)}
              updatingId={updatingId}
              onAccept={handleAccept}
              onReject={handleReject}
              onOpenChat={handleOpenChat}
              onLeaveReview={handleLeaveReview}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyRequests;
