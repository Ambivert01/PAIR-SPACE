/**
 * Feedback Modal
 *
 * Modal for collecting structured feedback from beta users
 */

import { useState } from "react";
import { submitFeedback } from "./feedbackService.js";

export default function FeedbackModal({ isOpen, onClose }) {
  const [step, setStep] = useState(1); // 1: type selection, 2: form
  const [type, setType] = useState("feedback");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    category: "general",
    title: "",
    description: "",
    likedMost: "",
    confusedBy: "",
    feltUnnecessary: "",
    mostUsedFeature: "",
    wouldImprove: "",
    rating: 0,
  });

  const handleTypeSelect = (selectedType) => {
    setType(selectedType);
    setStep(2);
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Get device info
      const deviceInfo = {
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        browser: navigator.userAgent,
      };

      await submitFeedback({
        type,
        ...formData,
        page: window.location.pathname,
        deviceInfo,
      });

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.message || "Failed to submit feedback");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-[var(--glass-bg-strong)] rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-[var(--glass-border)] flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">
            {success ? "Thank You!" : "Share Your Feedback"}
          </h2>
          <button
            onClick={onClose}
            className="text-[var(--text-tertiary)] hover:text-white transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {success ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🎉</div>
              <p className="text-xl text-white mb-2">
                Your feedback has been submitted!
              </p>
              <p className="text-[var(--text-tertiary)]">
                Thank you for helping us improve PairSpace.
              </p>
            </div>
          ) : step === 1 ? (
            // Step 1: Type selection
            <div className="space-y-4">
              <p className="text-[var(--text-secondary)] mb-6">
                What would you like to share with us?
              </p>

              <button
                onClick={() => handleTypeSelect("feedback")}
                className="w-full p-6 bg-slate-700 hover:bg-slate-600 rounded-xl text-left transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="text-3xl">💬</div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">
                      General Feedback
                    </h3>
                    <p className="text-[var(--text-tertiary)] text-sm">
                      Share your thoughts, suggestions, or experiences
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleTypeSelect("bug")}
                className="w-full p-6 bg-slate-700 hover:bg-slate-600 rounded-xl text-left transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="text-3xl">🐛</div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">
                      Report a Bug
                    </h3>
                    <p className="text-[var(--text-tertiary)] text-sm">
                      Something not working as expected?
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleTypeSelect("feature_request")}
                className="w-full p-6 bg-slate-700 hover:bg-slate-600 rounded-xl text-left transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="text-3xl">✨</div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">
                      Feature Request
                    </h3>
                    <p className="text-[var(--text-tertiary)] text-sm">
                      Suggest a new feature or improvement
                    </p>
                  </div>
                </div>
              </button>
            </div>
          ) : (
            // Step 2: Feedback form
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleChange("category", e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-purple-500 focus:outline-none"
                >
                  <option value="general">General</option>
                  <option value="chat">Chat</option>
                  <option value="memories">Memories</option>
                  <option value="activities">Activities</option>
                  <option value="games">Games</option>
                  <option value="planner">Planner</option>
                  <option value="ai">AI Features</option>
                  <option value="onboarding">Onboarding</option>
                  <option value="ui_ux">UI/UX</option>
                  <option value="performance">Performance</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  placeholder="Brief summary"
                  required
                  maxLength={200}
                  className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-purple-500 focus:outline-none"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Tell us more..."
                  required
                  maxLength={2000}
                  rows={4}
                  className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-purple-500 focus:outline-none resize-none"
                />
              </div>

              {/* Quick questions (for general feedback) */}
              {type === "feedback" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                      What did you like most?
                    </label>
                    <input
                      type="text"
                      value={formData.likedMost}
                      onChange={(e) =>
                        handleChange("likedMost", e.target.value)
                      }
                      placeholder="Optional"
                      className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-purple-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                      What confused you?
                    </label>
                    <input
                      type="text"
                      value={formData.confusedBy}
                      onChange={(e) =>
                        handleChange("confusedBy", e.target.value)
                      }
                      placeholder="Optional"
                      className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-purple-500 focus:outline-none"
                    />
                  </div>

                  {/* Rating */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                      Overall Rating
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => handleChange("rating", star)}
                          className="text-3xl transition-transform hover:scale-110"
                        >
                          {star <= formData.rating ? "⭐" : "☆"}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Error message */}
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-[var(--status-error)] text-sm">
                  {error}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-6 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Submitting..." : "Submit Feedback"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
