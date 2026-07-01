import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { getToken } from "../services/auth/authService.js";
import { getOnboardingStatus } from "../services/onboarding/onboardingService.js";

const CACHE_KEY = "pairspace_onboarding_complete";

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const token = getToken();

  // Cache onboarding completion in sessionStorage to avoid re-fetching
  // on every route change — only re-verify on fresh page load.
  const [onboardingComplete, setOnboardingComplete] = useState(
    () => sessionStorage.getItem(CACHE_KEY) === "true",
  );
  const [checked, setChecked] = useState(
    () => sessionStorage.getItem(CACHE_KEY) !== null,
  );

  useEffect(() => {
    if (!token || checked) return;
    getOnboardingStatus()
      .then((status) => {
        const complete = !!status?.completed;
        sessionStorage.setItem(CACHE_KEY, String(complete));
        setOnboardingComplete(complete);
      })
      .catch(() => {
        // If status check fails, don't block the user — fail open.
        setOnboardingComplete(true);
      })
      .finally(() => setChecked(true));
  }, [token, checked]);

  if (!token) return <Navigate to="/login" replace />;

  if (!checked) return null; // brief check, avoids flash of wrong content

  if (!onboardingComplete && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
}
