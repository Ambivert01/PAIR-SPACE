import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { getMyRelationship } from "../services/relationship/relationshipService.js";
import { setActiveRelationshipId } from "../services/relationship/relationshipContext.js";
import { getToken } from "../services/auth/authService.js";

const RelationshipContext = createContext(null);

/**
 * useRelationship — single source of truth for the active relationship.
 * Replaces the old pattern of every page independently calling
 * getMyRelationship() on mount (AppShell + RelationshipHomeUltra + ChatPageUltra
 * all fetching the same data 3x on a single page load).
 */
export const useRelationship = () => useContext(RelationshipContext);

export default function RelationshipProvider({ children }) {
  const [rel, setRel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!getToken()) {
      setLoading(false);
      return null;
    }
    try {
      const data = await getMyRelationship();
      setRel(data);
      setError(null);
      return data;
    } catch (err) {
      setError(err);
      setRel(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Switch to a different relationship (multi-relationship support) without
  // a full page reload — just re-fetches and updates context. All consumers
  // (sockets, pages) re-render with the new relationship instead of losing
  // all React/socket state to a hard refresh.
  const switchRelationship = useCallback(
    async (relationshipId) => {
      setActiveRelationshipId(relationshipId);
      setLoading(true);
      await refresh();
    },
    [refresh],
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <RelationshipContext.Provider value={{ rel, loading, error, refresh, switchRelationship, setRel }}>
      {children}
    </RelationshipContext.Provider>
  );
}
