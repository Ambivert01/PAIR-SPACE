/**
 * GiftAnimationPlayerUltra Component
 *
 * Premium gift animation player with enhanced particle effects
 */

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

const PARTICLES = {
  confetti: ["🎊", "🎉", "✨", "🌟", "💫"],
  floating_hearts: ["❤️", "💕", "💗", "💖", "💝"],
  sparkle: ["✨", "⭐", "🌟", "💫", "⚡"],
  balloon_pop: ["🎈", "🎊", "🎉", "🥳", "🎁"],
  emoji_burst: ["😍", "🥰", "💕", "✨", "🎉"],
};

export default function GiftAnimationPlayerUltra({
  animation = "confetti",
  onComplete,
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const emojis = PARTICLES[animation] || PARTICLES.confetti;
    const particles = [];
    const particleCount = 25; // Increased from 20

    for (let i = 0; i < particleCount; i++) {
      const el = document.createElement("div");
      el.textContent = emojis[Math.floor(Math.random() * emojis.length)];

      const size = Math.random() * 24 + 20; // 20-44px
      const startX = Math.random() * 100;
      const endX = startX + (Math.random() * 40 - 20); // Drift left/right
      const duration = Math.random() * 2 + 2; // 2-4s
      const delay = Math.random() * 0.8;
      const rotation = Math.random() * 1440 - 720; // -720 to 720 degrees

      el.style.cssText = `
        position: absolute;
        font-size: ${size}px;
        left: ${startX}%;
        top: -50px;
        pointer-events: none;
        filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.3));
        animation: fall-ultra ${duration}s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        animation-delay: ${delay}s;
        --end-x: ${endX}%;
        --rotation: ${rotation}deg;
      `;

      container.appendChild(el);
      particles.push(el);
    }

    const timer = setTimeout(() => {
      particles.forEach((p) => p.remove());
      onComplete?.();
    }, 4500); // Increased from 3500

    return () => {
      clearTimeout(timer);
      particles.forEach((p) => p.remove());
    };
  }, [animation, onComplete]);

  return (
    <>
      <style>{`
        @keyframes fall-ultra {
          0% {
            transform: translateY(0) translateX(0) rotate(0deg) scale(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
            transform: translateY(10vh) translateX(0) rotate(calc(var(--rotation) * 0.1)) scale(1);
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(110vh) translateX(calc(var(--end-x) - 50%)) rotate(var(--rotation)) scale(0.8);
            opacity: 0;
          }
        }
      `}</style>
      <motion.div
        ref={containerRef}
        className="fixed inset-0 pointer-events-none z-[200] overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />
    </>
  );
}
