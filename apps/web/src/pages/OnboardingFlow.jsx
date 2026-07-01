/**
 * Onboarding Flow
 *
 * Main orchestrator for the onboarding experience
 * Guides new users through setup step by step
 *
 * Simplified 3-step flow:
 * 1. Welcome - Introduction to PairSpace
 * 2. Personalization - Optional theme and preferences
 * 3. Feature Tour - Overview of key features
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import WelcomeScreen from "../components/onboarding/WelcomeScreen";
import OnboardingStepper from "../components/onboarding/OnboardingStepper";
import PersonalizationQuickSetup from "../components/onboarding/PersonalizationQuickSetup";
import FeatureTooltip from "../components/onboarding/FeatureTooltip";
import {
  getOnboardingStatus,
  updateOnboardingStep,
  completeOnboarding,
} from "../services/onboarding/onboardingService";
import { updatePersonalization } from "../features/personalization/personalizationService";

export default function OnboardingFlow() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);

  const steps = ["welcome", "personalization", "feature_tour"];

  // Load onboarding status on mount
  useEffect(() => {
    loadOnboardingStatus();
  }, []);

  const loadOnboardingStatus = async () => {
    try {
      const status = await getOnboardingStatus();

      // If already completed, redirect to home
      if (status.completed) {
        navigate("/app");
        return;
      }

      // Resume from current step
      const stepIndex = steps.indexOf(status.currentStep);
      if (stepIndex >= 0) {
        setCurrentStep(stepIndex);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleStepComplete = async (step) => {
    try {
      await updateOnboardingStep(step);

      // Move to next step
      const nextIndex = currentStep + 1;
      if (nextIndex < steps.length) {
        setCurrentStep(nextIndex);
      } else {
        handleComplete();
      }
    } catch (error) {
    }
  };

  const handleSkipStep = async (step) => {
    try {
      await updateOnboardingStep(step, true); // Mark as skipped

      // Move to next step
      const nextIndex = currentStep + 1;
      if (nextIndex < steps.length) {
        setCurrentStep(nextIndex);
      } else {
        handleComplete();
      }
    } catch (error) {
    }
  };

  const handleComplete = async () => {
    try {
      await completeOnboarding();
      sessionStorage.setItem("pairspace_onboarding_complete", "true");
      navigate("/app");
    } catch (error) {
    }
  };

  // Step handlers
  const handleWelcomeStart = () => {
    handleStepComplete("welcome");
  };

  const handlePersonalizationSave = async (form) => {
    try {
      // Personalization requires a relationship to exist.
      // During onboarding no relationship exists yet, so we store the
      // theme preference in sessionStorage and apply it after the user
      // creates/joins a relationship.
      if (form.theme) {
        sessionStorage.setItem("pairspace_pending_theme", form.theme);
      }
      if (form.relationshipName) {
        sessionStorage.setItem("pairspace_pending_space_name", form.relationshipName);
      }
      // Attempt to apply now (silently fails if no relationship yet)
      if (form.theme || form.relationshipName) {
        updatePersonalization({ theme: form.theme, relationshipName: form.relationshipName }).catch(() => {});
      }
    } catch {
      // Non-fatal — continue to next step
    }
    handleStepComplete("personalization");
  };

  const handleFeatureTourComplete = () => {
    handleStepComplete("feature_tour");
  };

  // Feature tour data
  const features = [
    {
      emoji: "💬",
      title: "Chat",
      description:
        "Send messages, voice notes, and media to your partner. Your private conversation space.",
    },
    {
      emoji: "📸",
      title: "Memories",
      description:
        "Create and share special moments. Build your timeline together.",
    },
    {
      emoji: "🎮",
      title: "Activities & Games",
      description:
        "Watch together, play games, and have fun. Stay connected through shared experiences.",
    },
    {
      emoji: "📅",
      title: "Planner",
      description:
        "Plan dates, set reminders, and organize your life together.",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <motion.div
          className="flex flex-col items-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="w-8 h-8 border-2 border-[var(--accent-dream)] border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-[var(--text-tertiary)] text-sm">Loading...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Progress Stepper (except for welcome screen) */}
      {currentStep > 0 && (
        <OnboardingStepper
          currentStep={currentStep - 1}
          totalSteps={steps.length - 1}
        />
      )}

      {/* Step Content */}
      {currentStep === 0 && <WelcomeScreen onStart={handleWelcomeStart} />}

      {currentStep === 1 && (
        <PersonalizationQuickSetup
          onSave={handlePersonalizationSave}
          onSkip={() => handleSkipStep("personalization")}
        />
      )}

      {currentStep === 2 && (
        <FeatureTooltip
          features={features}
          onComplete={handleFeatureTourComplete}
          onSkip={() => handleSkipStep("feature_tour")}
        />
      )}
    </div>
  );
}
