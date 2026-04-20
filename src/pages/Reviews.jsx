import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useRequests } from "../hooks/useRequests";
import { addReview, getReviewerReviewForRequest } from "../services/reviewService";
import { updateRequestStatus } from "../services/requestService";
import { updateListingStatus } from "../services/listingService";

const ratings = [5, 4, 3, 2, 1];

const Reviews = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestId = searchParams.get("requestId");
  const { requests, loading } = useRequests(user?.uid);
  const [rating, setRating] = useState("5");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [checkingExisting, setCheckingExisting] = useState(false);
  const [existingReview, setExistingReview] = useState(null);
  const [error, setError] = useState("");

  const request = useMemo(
    () => (requests ?? []).find((item) => item?.id === requestId),
    [requestId, requests]
  );

  const canReview = request?.status === "accepted";
  const toUser =
    request?.fromUser === user?.uid ? request?.toUser : request?.fromUser;
  const alreadyReviewed = Boolean(existingReview?.id);

  useEffect(() => {
    let cancelled = false;

    const loadExistingReview = async () => {
      if (!user?.uid || !request?.id) {
        setExistingReview(null);
        return;
      }

      try {
        setCheckingExisting(true);
        const review = await getReviewerReviewForRequest(user.uid, request.id);
        if (!cancelled) {
          setExistingReview(review);
        }
      } catch {
        if (!cancelled) {
          setExistingReview(null);
        }
      } finally {
        if (!cancelled) {
          setCheckingExisting(false);
        }
      }
    };

    loadExistingReview();

    return () => {
      cancelled = true;
    };
  }, [user?.uid, request?.id]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (alreadyReviewed) {
      setError("You already submitted a review for this request.");
      return;
    }

    if (!user?.uid || !canReview || !toUser) {
      setError("This review is not available.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      await addReview({
        fromUser: user.uid,
        toUser,
        rating: Number(rating),
        comment,
        requestId: request?.id,
        listingId: request?.listingId,
      });

      // Close the accepted trade once a review is submitted.
      await updateRequestStatus(request.id, "completed");
      if (request?.listingId) {
        await updateListingStatus(request.listingId, "closed", request.id);
      }
      navigate("/my-requests");
    } catch (submitError) {
      setError(
        submitError?.message || "Unable to submit your review right now."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || checkingExisting) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-500/20 border-t-cyan-500" />
      </div>
    );
  }

  if (!canReview) {
    return (
      <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center p-6">
        <div className="w-full max-w-lg rounded-[32px] border border-white/10 bg-white/[0.03] p-8 text-center">
          <h1 className="text-2xl font-bold">Review unavailable</h1>
          <p className="mt-3 text-sm text-gray-400">
            Reviews can only be left from accepted requests.
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
      <div className="mx-auto max-w-2xl rounded-[32px] border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl shadow-xl">
        <Link
          to="/my-requests"
          className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
        >
          ← My requests
        </Link>

        <h1 className="mt-4 text-3xl font-bold">Leave a review</h1>
        <p className="mt-2 text-sm text-gray-400">
          Share how the exchange went to help build trust in the community.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {error && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {alreadyReviewed && (
            <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-200">
              You already reviewed this request. Reviews are locked after submission.
            </div>
          )}

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-gray-500">
              Rating
            </label>
            <select
              value={rating}
              onChange={(event) => setRating(event.target.value)}
              disabled={alreadyReviewed}
              className="w-full rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-4 text-sm outline-none transition-all focus:border-cyan-500/40"
            >
              {ratings.map((value) => (
                <option key={value} value={value} className="bg-slate-900">
                  {value} star{value === 1 ? "" : "s"}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-gray-500">
              Comment
            </label>
            <textarea
              rows="5"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              disabled={alreadyReviewed}
              placeholder="What was it like working with this member?"
              className="w-full resize-none rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-4 text-sm outline-none transition-all focus:border-purple-500/40"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || alreadyReviewed}
            className="w-full rounded-2xl bg-gradient-to-r from-[#a855f7] to-[#2dd4bf] px-6 py-4 text-sm font-semibold text-white transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {alreadyReviewed
              ? "Review already submitted"
              : submitting
                ? "Submitting..."
                : "Submit review"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Reviews;
