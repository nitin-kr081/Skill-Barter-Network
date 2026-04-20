import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useListings } from "./useListings";
import { useRequests } from "./useRequests";
import { normalizeSkillsArray, getListingMatchMeta } from "../utils/listingMatch";
import { getUserProfile, getUserProfilesByIds } from "../services/userService";
import { createChatId } from "../services/chatService";

const buildListingMap = (listings) =>
  Object.fromEntries((listings ?? []).filter((item) => item?.id).map((item) => [item.id, item]));

export const useDashboardData = () => {
  const { user } = useAuth();
  const { listings, loading: listingsLoading } = useListings();
  const { requests, loading: requestsLoading } = useRequests(user?.uid);
  const [myProfile, setMyProfile] = useState(null);
  const [tradeProfiles, setTradeProfiles] = useState({});
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      if (!user?.uid) {
        setMyProfile(null);
        setProfileLoading(false);
        return;
      }

      try {
        setProfileLoading(true);
        const data = await getUserProfile(user.uid);
        if (!cancelled) {
          setMyProfile(data);
        }
      } catch (error) {
        if (!cancelled) {
          setMyProfile(null);
        }
      } finally {
        if (!cancelled) {
          setProfileLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [user?.uid]);

  const listingMap = useMemo(() => buildListingMap(listings), [listings]);

  const stats = useMemo(() => {
    const totalListings = (listings ?? []).filter((item) => item?.userId === user?.uid).length;

    return {
      totalListings,
      pendingRequests: (requests ?? []).filter((item) => item?.status === "pending").length,
      acceptedRequests: (requests ?? []).filter((item) => item?.status === "accepted").length,
      rejectedRequests: (requests ?? []).filter((item) => item?.status === "rejected").length,
    };
  }, [listings, requests, user?.uid]);

  const activeTrades = useMemo(
    () =>
      (requests ?? [])
        .filter((request) => request?.status === "accepted")
        .map((request) => {
          const otherUserId =
            request?.fromUser === user?.uid ? request?.toUser : request?.fromUser;
          const listing = listingMap[request?.listingId];

          return {
            ...request,
            otherUserId,
            listing,
            chatId:
              user?.uid && otherUserId ? createChatId(user.uid, otherUserId) : "",
          };
        })
        .filter((trade) => trade?.otherUserId),
    [listingMap, requests, user?.uid]
  );

  useEffect(() => {
    let cancelled = false;

    const loadTradeProfiles = async () => {
      try {
        const ids = activeTrades.map((trade) => trade?.otherUserId).filter(Boolean);
        const profiles = await getUserProfilesByIds(ids);
        if (!cancelled) {
          setTradeProfiles(profiles);
        }
      } catch (error) {
        if (!cancelled) {
          setTradeProfiles({});
        }
      }
    };

    loadTradeProfiles();

    return () => {
      cancelled = true;
    };
  }, [JSON.stringify(activeTrades.map((trade) => trade?.otherUserId).filter(Boolean))]);

  const recommendations = useMemo(() => {
    const normalizedSkills = normalizeSkillsArray(myProfile?.skillsOffered ?? []);

    return (listings ?? [])
      .filter((listing) => listing?.userId && listing?.userId !== user?.uid)
      .map((listing) => {
        const match = getListingMatchMeta(listing, normalizedSkills);
        return { ...listing, ...match };
      })
      .filter((listing) => listing?.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 5);
  }, [listings, myProfile?.skillsOffered, user?.uid]);

  return {
    loading: listingsLoading || requestsLoading || profileLoading,
    stats,
    activeTrades: activeTrades.map((trade) => ({
      ...trade,
      otherUserProfile: tradeProfiles?.[trade.otherUserId] ?? null,
    })),
    recommendations,
  };
};
