import { useEffect, useMemo, useState } from "react";
import { getUsersReviewSummaries } from "../services/reviewService";

export const useReviewSummaries = (userIds) => {
  const normalizedIds = useMemo(
    () => [...new Set((userIds ?? []).filter(Boolean))].sort(),
    [JSON.stringify(userIds ?? [])]
  );
  const normalizedKey = normalizedIds.join("|");
  const [summaries, setSummaries] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadSummaries = async () => {
      try {
        setLoading(true);
        const data = await getUsersReviewSummaries(normalizedIds);
        if (!cancelled) {
          setSummaries(data);
        }
      } catch (error) {
        if (!cancelled) {
          setSummaries({});
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadSummaries();

    return () => {
      cancelled = true;
    };
  }, [normalizedKey]);

  return { summaries, loading };
};
