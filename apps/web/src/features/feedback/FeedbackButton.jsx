/**
 * Feedback Button
 *
 * Floating button for users to submit feedback during beta
 */

import { useState } from "react";
import FeedbackModal from "./FeedbackModal.jsx";

export default function FeedbackButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating feedback button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2"
        aria-label="Give Feedback"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
          />
        </svg>
        <span className="font-medium">Give Feedback</span>
      </button>

      {/* Feedback modal */}
      {isOpen && (
        <FeedbackModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
      )}
    </>
  );
}
