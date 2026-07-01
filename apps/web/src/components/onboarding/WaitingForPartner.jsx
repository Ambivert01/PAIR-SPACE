/**
 * Waiting for Partner - Phase 4 of Onboarding
 *
 * Shown while waiting for partner to accept invite
 */

import { useState } from "react";

export default function WaitingForPartner({
  partnerEmail,
  inviteLink,
  onContinue,
}) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join me on PairSpace",
          text: "I created a private space for us on PairSpace. Join me!",
          url: inviteLink,
        });
      } catch (err) {
        // User cancelled share
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--bg-primary)] via-[var(--bg-secondary)] to-[var(--bg-tertiary)] p-4">
      <div className="max-w-md w-full space-y-6 text-center">
        {/* Animated Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-24 h-24 bg-white/10 backdrop-blur-lg rounded-full flex items-center justify-center border border-white/20 animate-pulse">
              <svg
                className="w-12 h-12 text-[var(--text-secondary)]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            {/* Pulse rings */}
            <div className="absolute inset-0 rounded-full border-2 border-purple-400 animate-ping opacity-20"></div>
          </div>
        </div>

        {/* Message */}
        <div className="space-y-3">
          <h2 className="text-3xl font-bold text-white">
            Waiting for your partner to join...
          </h2>
          <p className="text-lg text-purple-200">
            We sent an invitation to{" "}
            <strong className="text-white">{partnerEmail}</strong>
          </p>
          <p className="text-sm text-[var(--text-secondary)]">
            Once they accept, your space will be ready! 🎉
          </p>
        </div>

        {/* Share Options */}
        <div className="space-y-3">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <p className="text-sm text-purple-200 mb-3">
              Want to speed things up? Share the invite link directly:
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={inviteLink}
                readOnly
                className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white outline-none"
              />
              <button
                onClick={handleCopyLink}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white text-sm font-medium transition-colors"
              >
                {copied ? "✓ Copied" : "Copy"}
              </button>
            </div>
          </div>

          <button
            onClick={handleShare}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold py-3 rounded-xl transition-all"
          >
            Share Invite Link
          </button>
        </div>

        {/* What happens next */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 text-left">
          <h3 className="text-sm font-semibold text-white mb-3">
            What happens next?
          </h3>
          <div className="space-y-2 text-sm text-purple-200">
            <div className="flex gap-2">
              <span>1.</span>
              <span>Your partner receives the invitation email</span>
            </div>
            <div className="flex gap-2">
              <span>2.</span>
              <span>They create their account and accept</span>
            </div>
            <div className="flex gap-2">
              <span>3.</span>
              <span>Your space becomes active instantly!</span>
            </div>
          </div>
        </div>

        {/* Continue anyway */}
        <button
          onClick={onContinue}
          className="text-[var(--text-secondary)] hover:text-white text-sm transition-colors"
        >
          Continue exploring while I wait
        </button>
      </div>
    </div>
  );
}
