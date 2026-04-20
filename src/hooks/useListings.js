import { useEffect, useState } from "react";
import { subscribeListings } from "../services/listingService";

/**
 * Real-time marketplace listings (newest first via Firestore query).
 * @returns {{ listings: object[], loading: boolean }}
 */
export const useListings = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeListings(
      (data) => {
        setListings(Array.isArray(data) ? data : []);
        setLoading(false);
      },
      () => {
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  return { listings, loading };
};
