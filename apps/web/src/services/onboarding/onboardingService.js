import api from "../api.js";

/**
 * Get onboarding status
 */
export async function getOnboardingStatus() {
  const response = await api.get("/api/onboarding/status");
  return response.data.data;
}

/**
 * Update onboarding step
 */
export async function updateOnboardingStep(step, skipped = false) {
  const response = await api.post("/api/onboarding/step", { step, skipped });
  return response.data.data;
}

/**
 * Complete onboarding
 */
export async function completeOnboarding() {
  const response = await api.post("/api/onboarding/complete");
  return response.data.data;
}

/**
 * Reset onboarding (for testing)
 */
export async function resetOnboarding() {
  const response = await api.post("/api/onboarding/reset");
  return response.data.data;
}
