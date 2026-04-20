import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import TrustBadge from "../components/TrustBadge";
import { useDashboardData } from "../hooks/useDashboardData";
import { useReviewSummaries } from "../hooks/useReviewSummaries";
import { logout } from "../services/authService";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { loading, stats, activeTrades, recommendations } = useDashboardData();
  const { summaries, loading: trustLoading } = useReviewSummaries(
    user?.uid ? [user.uid] : []
  );

  const handleSignOut = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error(err);
    }
  };

  const statCards = [
    { label: "Total listings", value: stats.totalListings },
    { label: "Pending requests", value: stats.pendingRequests },
    { label: "Accepted requests", value: stats.acceptedRequests },
    { label: "Rejected requests", value: stats.rejectedRequests },
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[45%] h-[45%] bg-purple-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[35%] h-[35%] bg-cyan-500/10 blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-12 md:px-12 md:py-16">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-8 mb-14">
          <div>
            <Link
              to="/"
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors mb-4 inline-block"
            >
              ← Home
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-gray-500 mt-2 text-sm md:text-base max-w-lg">
              Signed in as{" "}
              <span className="text-gray-300">{user?.email || "member"}</span>
              . Track your swaps, requests, and recommendations in one place.
            </p>
            <TrustBadge
              summary={summaries?.[user?.uid]}
              loading={trustLoading}
              className="mt-4"
            />
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="shrink-0 px-5 py-2.5 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-all text-sm font-medium self-start"
          >
            Sign out
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-500/20 border-t-cyan-500" />
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
              {statCards.map((card) => (
                <div
                  key={card.label}
                  className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl shadow-xl"
                >
                  <p className="text-xs uppercase tracking-widest text-gray-500">
                    {card.label}
                  </p>
                  <p className="mt-4 text-3xl font-bold">{card.value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1.3fr_0.7fr] gap-6">
              <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl shadow-xl">
                <div className="flex items-center justify-between gap-3 mb-5">
                  <div>
                    <h2 className="text-xl font-bold">Active trades</h2>
                    <p className="text-sm text-gray-500">
                      Accepted requests with direct chat access.
                    </p>
                  </div>
                  <Link
                    to="/my-requests"
                    className="text-sm text-cyan-300 hover:text-cyan-200 transition-colors"
                  >
                    View all
                  </Link>
                </div>

                <div className="space-y-4">
                  {activeTrades.length === 0 ? (
                    <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-10 text-center text-sm text-gray-400">
                      No active trades yet.
                    </div>
                  ) : (
                    activeTrades.map((trade) => (
                      <div
                        key={trade.id}
                        className="rounded-2xl border border-white/10 bg-white/[0.02] p-4"
                      >
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                          <div>
                            <p className="text-lg font-semibold">
                              {trade?.otherUserProfile?.name ||
                                trade?.otherUserProfile?.email ||
                                "Community member"}
                            </p>
                            <p className="mt-1 text-sm text-gray-400">
                              {trade?.listing?.title || "Listing unavailable"}
                            </p>
                          </div>
                          <Link
                            to={`/chat?chatId=${encodeURIComponent(trade.chatId)}&userId=${encodeURIComponent(trade.otherUserId)}&requestId=${encodeURIComponent(trade.id)}`}
                            className="rounded-xl border border-cyan-500/25 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-200 hover:bg-cyan-500/20 transition-all"
                          >
                            Open chat
                          </Link>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>

              <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl shadow-xl">
                <h2 className="text-xl font-bold">Quick actions</h2>
                <div className="mt-5 grid grid-cols-1 gap-3">
                  <Link
                    to="/listings"
                    className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-4 text-sm hover:bg-white/[0.05] transition-all"
                  >
                    Browse marketplace
                  </Link>
                  <Link
                    to="/create"
                    className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-4 text-sm hover:bg-white/[0.05] transition-all"
                  >
                    Create listing
                  </Link>
                  <Link
                    to="/profile"
                    className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-4 text-sm hover:bg-white/[0.05] transition-all"
                  >
                    Update profile
                  </Link>
                  <Link
                    to="/my-listings"
                    className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-4 text-sm hover:bg-white/[0.05] transition-all"
                  >
                    Manage my listings
                  </Link>
                </div>
              </section>
            </div>

            <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl shadow-xl">
              <div className="flex items-center justify-between gap-3 mb-5">
                <div>
                  <h2 className="text-xl font-bold">Recommended matches</h2>
                  <p className="text-sm text-gray-500">
                    Listings that align with your offered skills.
                  </p>
                </div>
                <Link
                  to="/listings"
                  className="text-sm text-cyan-300 hover:text-cyan-200 transition-colors"
                >
                  Open feed
                </Link>
              </div>

              {recommendations.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-10 text-center text-sm text-gray-400">
                  No recommendations yet. Add more skills to your profile to improve matching.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {recommendations.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-white/10 bg-white/[0.02] p-4"
                    >
                      <h3 className="text-lg font-semibold">{item?.title}</h3>
                      <p className="mt-2 text-sm text-gray-400 line-clamp-2">
                        {item?.description}
                      </p>
                      <p className="mt-4 text-xs text-emerald-300">
                        Match score: {item?.matchScore}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
