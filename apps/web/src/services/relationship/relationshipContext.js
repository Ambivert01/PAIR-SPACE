const KEY = "pairspace_active_rel";

export const getActiveRelationshipId = () => localStorage.getItem(KEY);

export const setActiveRelationshipId = (id) => {
  if (id) localStorage.setItem(KEY, id);
  else localStorage.removeItem(KEY);
};

export const clearActiveRelationshipId = () => localStorage.removeItem(KEY);
