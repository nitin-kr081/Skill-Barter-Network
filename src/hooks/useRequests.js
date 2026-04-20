import { useEffect, useReducer } from "react";
import { subscribeRequests } from "../services/requestService";

const initialState = {
  requests: [],
  loading: true,
};

const requestReducer = (state, action) => {
  switch (action.type) {
    case "SET_REQUESTS":
      return {
        ...state,
        requests: (action.payload ?? []).map((r) => ({
          ...r,
          // Ensure backward compatibility for old data
          fromUserReviewed: r.fromUserReviewed ?? false,
          toUserReviewed: r.toUserReviewed ?? false,
        })),
        loading: false,
      };

    case "ADD_REQUEST": {
      const row = action.payload;
      if (!row?.id) return state;

      const rest = state.requests.filter((r) => r.id !== row.id);

      return {
        ...state,
        requests: [
          {
            ...row,
            fromUserReviewed: row.fromUserReviewed ?? false,
            toUserReviewed: row.toUserReviewed ?? false,
          },
          ...rest,
        ],
      };
    }

    case "UPDATE_REQUEST": {
      const { id, updates } = action.payload ?? {};
      if (!id) return state;

      return {
        ...state,
        requests: state.requests.map((r) =>
          r.id === id
            ? {
                ...r,
                ...updates,
                fromUserReviewed:
                  updates?.fromUserReviewed ?? r.fromUserReviewed ?? false,
                toUserReviewed:
                  updates?.toUserReviewed ?? r.toUserReviewed ?? false,
              }
            : r
        ),
      };
    }

    default:
      return state;
  }
};

/**
 * @param {string | undefined} userId
 */
export const useRequests = (userId) => {
  const [state, dispatch] = useReducer(requestReducer, initialState);

  useEffect(() => {
    if (!userId) {
      dispatch({ type: "SET_REQUESTS", payload: [] });
      return;
    }

    const unsubscribe = subscribeRequests(
      userId,
      (rows) => dispatch({ type: "SET_REQUESTS", payload: rows }),
      () => dispatch({ type: "SET_REQUESTS", payload: [] })
    );

    return () => unsubscribe();
  }, [userId]);

  return {
    requests: state.requests,
    loading: state.loading,
    dispatch,
  };
};