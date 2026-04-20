import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import TrustBadge, { getTrustLevel } from "../components/TrustBadge";
import { getUserProfile } from "../services/userService";
import { getRecentUserReviews, getUserReviewSummary } from "../services/reviewService";

const formatReviewDate = (createdAt) => {
  const date =
    typeof createdAt?.toDate === "function"
      ? createdAt.toDate()
      : createdAt
        ? new Date(createdAt)
        : null;

  if (!date || Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString();
};

const UserProfile = () => {
  const { userId } = useParams();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [summary, setSummary] = useState({ averageRating: 0, count: 0 });
  const [recentReviews, setRecentReviews] = useState([]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [profileData, summaryData, reviewsData] = await Promise.all([
          getUserProfile(userId),
          getUserReviewSummary(userId),
          getRecentUserReviews(userId, 5),
        ]);

        if (!cancelled) {
          setProfile(profileData);
          setSummary(summaryData);
          setRecentReviews(reviewsData);
        }
      } catch {
        if (!cancelled) {
          setProfile(null);
          setSummary({ averageRating: 0, count: 0 });
          setRecentReviews([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const displayName = useMemo(
    () => profile?.name || "Community member",
    [profile?.name]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-500/20 border-t-cyan-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 md:p-10 font-sans">
      <div className="mx-auto max-w-3xl rounded-[28px] border border-white/10 bg-white/[0.03] p-8 shadow-xl">
        <Link
          to="/listings"
          className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
        >
          ← Back
        </Link>

        <h1 className="mt-4 text-3xl font-bold">{displayName}</h1>
        <TrustBadge summary={summary} showLevel className="mt-4" />
        <p className="mt-2 text-sm text-gray-500">
          Trust level: {getTrustLevel(summary)}
        </p>

        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Recent reviews</h2>
          {recentReviews.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-8 text-sm text-gray-400">
              No reviews yet
            </div>
          ) : (
            <div className="space-y-3">
              {recentReviews.map((review) => (
                <div
                  key={review.id}
                  className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-4"
                >
                  <p className="text-amber-300 text-sm font-medium">
                    ★ {review?.rating ?? "-"}
                  </p>
                  <p className="mt-1 text-sm text-gray-200">
                    {review?.comment?.trim() || "No comment provided."}
                  </p>
                  <p className="mt-2 text-xs text-gray-500">
                    {formatReviewDate(review?.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
