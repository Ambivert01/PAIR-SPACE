/**
 * Onboarding Stepper
 *
 * Shows progress through onboarding steps
 * Minimal and non-intrusive design
 */

export default function OnboardingStepper({ currentStep, totalSteps }) {
  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="glass-strong rounded-full px-4 py-2">
        <div className="hstack-sm">
          {/* Step indicators */}
          {Array.from({ length: totalSteps }).map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all ${
                index < currentStep
                  ? "w-8 bg-gradient-to-r from-pink-500 to-purple-600"
                  : index === currentStep
                    ? "w-12 bg-gradient-to-r from-pink-500 to-purple-600"
                    : "w-2 bg-white/30"
              }`}
            />
          ))}

          {/* Step counter */}
          <span className="text-xs text-white/80 ml-2 font-medium">
            {currentStep + 1}/{totalSteps}
          </span>
        </div>
      </div>
    </div>
  );
}
