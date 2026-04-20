const TrustBadge = ({ summary, loading = false, className = "" }) => {
  if (loading) {
    return (
      <span
        className={`inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-400 ${className}`}
      >
        Loading trust...
      </span>
    );
  }

  const count = summary?.count ?? 0;
  const averageRating = summary?.averageRating ?? 0;

  return (
    <span
      className={`inline-flex items-center rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-200 ${className}`}
    >
      {count > 0 ? `★ ${averageRating} (${count} review${count === 1 ? "" : "s"})` : "★ No reviews yet"}
    </span>
  );
};

export default TrustBadge;
