export const getTrustLevel = (summary) => {
  const averageRating = Number(summary?.averageRating ?? 0);
  const count = Number(summary?.count ?? 0);

  if (!count) return "No Rating";
  if (averageRating >= 4.5) return "Highly Trusted";
  if (averageRating >= 3.5) return "Trusted";
  return "Low Rating";
};

const TrustBadge = ({ summary, loading = false, className = "", showLevel = false }) => {
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
  const level = getTrustLevel(summary);

  return (
    <div className={`inline-flex flex-col gap-1 ${className}`}>
      <span className="inline-flex items-center rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-200">
        {count > 0 ? `★ ${averageRating} (${count} review${count === 1 ? "" : "s"})` : "★ No reviews yet"}
      </span>
      {showLevel && (
        <span className="text-[11px] text-gray-400">{level}</span>
      )}
    </div>
  );
};

export default TrustBadge;
