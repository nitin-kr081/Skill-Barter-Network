import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import TrustBadge from "../components/TrustBadge";
import { getUserProfile } from "../services/userService";
import { sendRequest } from "../services/requestService";
import { useListings } from "../hooks/useListings";
import { useRequests } from "../hooks/useRequests";
import { useReviewSummaries } from "../hooks/useReviewSummaries";
import {
  getListingMatchMeta,
  normalizeSkillsArray,
} from "../utils/listingMatch";

const buildEnrichedListings = (rows, mySkillsOfferedNormalized) => {
  if (!Array.isArray(rows)) return [];
  return rows.map((listing) => {
    const { matchScore, isMatch } = getListingMatchMeta(
      listing,
      mySkillsOfferedNormalized
    );
    return { ...listing, matchScore, isMatch };
  });
};

const buildPendingOutgoingListingIds = (requests, uid) => {
  if (!uid || !Array.isArray(requests)) return new Set();
  return new Set(
    requests
      .filter((r) => r?.fromUser === uid && r?.status === "pending")
      .map((r) => r?.listingId)
      .filter(Boolean)
  );
};

const ListingCard = ({
  item,
  user,
  hasPendingInterest,
  interestDisabled,
  sending,
  onInterested,
  reviewSummary,
  trustLoading,
}) => {
  const isOwn = item?.userId && user?.uid && item.userId === user.uid;

  return (
    <div className="group bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-[32px] p-8 shadow-xl hover:border-white/20 transition-all hover:-translate-y-1">
      <div className="flex items-start justify-between gap-3 mb-4">
        <h3 className="text-xl font-bold group-hover:text-cyan-400 transition">
          {item?.title}
        </h3>
        {item?.isMatch && (
          <span className="shrink-0 inline-flex flex-col items-end gap-0.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-300">
            <span>Match</span>
            {item?.matchScore > 0 && (
              <span className="normal-case font-medium text-emerald-400/80">
                {item.matchScore} skill{item.matchScore === 1 ? "" : "s"}
              </span>
            )}
          </span>
        )}
      </div>

      <p className="text-gray-400 text-sm mb-6 line-clamp-3">
        {item?.description}
      </p>

      <div className="space-y-4 mb-6">
        <div>
          <span className="text-xs text-cyan-400 font-semibold">Offering</span>
          <div className="flex flex-wrap gap-2 mt-2">
            {item?.skillsOffered?.map((s, i) => (
              <span
                key={i}
                className="px-3 py-1 text-xs bg-cyan-500/10 border border-cyan-500/20 rounded-full"
              >
                {s}
              </span>
            ))}
          </div>
        </div>

        <div>
          <span className="text-xs text-purple-400 font-semibold">Wanted</span>
          <div className="flex flex-wrap gap-2 mt-2">
            {item?.skillsWanted?.map((s, i) => (
              <span
                key={i}
                className="px-3 py-1 text-xs bg-purple-500/10 border border-purple-500/20 rounded-full"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-500">Posted by: {item?.userEmail}</p>
      <TrustBadge
        summary={reviewSummary}
        loading={trustLoading}
        className="mt-4"
      />

      {isOwn ? (
        <p className="mt-5 text-center text-xs text-gray-500 font-medium">
          Your listing
        </p>
      ) : (
        <button
          type="button"
          disabled={interestDisabled}
          onClick={() => onInterested(item)}
          className="mt-5 w-full py-3 rounded-2xl text-sm font-semibold text-white border border-emerald-500/20 bg-gradient-to-r from-emerald-500/15 to-cyan-500/15 hover:from-emerald-500/25 hover:to-cyan-500/25 hover:border-emerald-500/30 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {sending
            ? "Sending…"
            : hasPendingInterest
              ? "Interest sent"
              : "Interested"}
        </button>
      )}
    </div>
  );
};

const Listings = () => {
  const { user } = useAuth();
  const { listings, loading: listingsLoading } = useListings();
  const { requests, loading: requestsLoading, dispatch } = useRequests(
    user?.uid
  );

  const [mySkillsOffered, setMySkillsOffered] = useState([]);
  const [profileLoading, setProfileLoading] = useState(true);
  const [sendingListingId, setSendingListingId] = useState(null);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  useEffect(() => {
    if (!user?.uid) {
      setMySkillsOffered([]);
      setProfileLoading(false);
      return;
    }

    let cancelled = false;
    const load = async () => {
      try {
        setProfileLoading(true);
        const data = await getUserProfile(user.uid);
        if (cancelled) return;
        const raw = Array.isArray(data?.skillsOffered)
          ? data.skillsOffered
          : [];
        setMySkillsOffered(normalizeSkillsArray(raw));
      } catch (err) {
        console.error(err);
        if (!cancelled) setMySkillsOffered([]);
      } finally {
        if (!cancelled) setProfileLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const mySkillsOfferedNormalized = useMemo(
    () => normalizeSkillsArray(mySkillsOffered),
    [mySkillsOffered]
  );

  const enrichedListings = useMemo(
    () => buildEnrichedListings(listings, mySkillsOfferedNormalized),
    [listings, mySkillsOfferedNormalized]
  );

  const pendingOutgoingListingIds = useMemo(
    () => buildPendingOutgoingListingIds(requests, user?.uid),
    [requests, user?.uid]
  );
  const listingOwnerIds = useMemo(
    () =>
      [...new Set(enrichedListings.map((item) => item?.userId).filter(Boolean))],
    [enrichedListings]
  );
  const { summaries: reviewSummaries, loading: trustLoading } =
    useReviewSummaries(listingOwnerIds);

  const handleInterested = useCallback(
    async (listing) => {
      const uid = user?.uid;
      const ownerId = listing?.userId;
      const listingId = listing?.id;
      if (!uid || !ownerId || !listingId) return;

      try {
        setFeedback({ type: "", message: "" });
        setSendingListingId(listingId);
        const id = await sendRequest({
          fromUser: uid,
          toUser: ownerId,
          listingId,
        });
        console.log("Request sent successfully", {
          requestId: id,
          listingId,
          toUser: ownerId,
        });
        dispatch({
          type: "ADD_REQUEST",
          payload: {
            id,
            fromUser: uid,
            toUser: ownerId,
            listingId,
            status: "pending",
            createdAt: new Date().toISOString(),
          },
        });
        setFeedback({
          type: "success",
          message: "Interest sent successfully.",
        });
      } catch (err) {
        console.error(err);
        setFeedback({
          type: "error",
          message: "Could not send interest right now.",
        });
      } finally {
        setSendingListingId(null);
      }
    },
    [dispatch, user?.uid]
  );

  const pageLoading = listingsLoading || profileLoading;

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 md:p-12 relative overflow-hidden font-sans">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-cyan-500/10 blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
              Feed
            </h1>
            <p className="text-gray-500 mt-2">
              Live listings — newest first. Matches use your profile skills.
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <Link to="/dashboard">
              <button className="px-6 py-3 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-sm font-medium">
                Dashboard
              </button>
            </Link>
            <Link to="/my-requests">
              <button className="px-6 py-3 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-sm font-medium">
                My requests
              </button>
            </Link>
            <Link to="/my-listings">
              <button className="px-6 py-3 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-sm font-medium">
                My Posts
              </button>
            </Link>

            <Link to="/create">
              <button className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#a855f7] to-[#2dd4bf] text-white font-bold text-sm hover:brightness-110 active:scale-95 transition-all">
                + Create New
              </button>
            </Link>
          </div>
        </div>

        {requestsLoading && (
          <p className="text-xs text-gray-500 mb-4">Syncing your requests…</p>
        )}

        {feedback.message && (
          <div
            className={`mb-6 rounded-2xl px-4 py-3 text-sm ${
              feedback.type === "error"
                ? "border border-red-500/20 bg-red-500/10 text-red-300"
                : "border border-cyan-500/20 bg-cyan-500/10 text-cyan-300"
            }`}
          >
            {feedback.message}
          </div>
        )}

        {enrichedListings.length === 0 && (
          <div className="text-center py-20 bg-white/[0.02] border border-white/5 rounded-[40px] backdrop-blur-xl">
            <p className="text-gray-500 text-lg">No listings</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrichedListings.map((item) => {
            const hasPendingInterest = pendingOutgoingListingIds.has(item.id);
            const sending = sendingListingId === item.id;
            const interestDisabled =
              requestsLoading ||
              hasPendingInterest ||
              sending ||
              !item?.userId;

            return (
              <ListingCard
                key={item.id}
                item={item}
                user={user}
                hasPendingInterest={hasPendingInterest}
                interestDisabled={interestDisabled}
                sending={sending}
                onInterested={handleInterested}
                reviewSummary={reviewSummaries?.[item?.userId]}
                trustLoading={trustLoading}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Listings;
