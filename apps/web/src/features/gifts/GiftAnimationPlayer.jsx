import { useEffect, useRef } from "react";

const PARTICLES = {
  confetti:       ["🎊","🎉","✨","🌟","💫"],
  floating_hearts:["❤️","💕","💗","💖","💝"],
  sparkle:        ["✨","⭐","🌟","💫","⚡"],
  balloon_pop:    ["🎈","🎊","🎉","🥳","🎁"],
  emoji_burst:    ["😍","🥰","💕","✨","🎉"],
};

export default function GiftAnimationPlayer({ animation = "confetti", onComplete }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const emojis = PARTICLES[animation] || PARTICLES.confetti;
    const particles = [];

    for (let i = 0; i < 20; i++) {
      const el = document.createElement("div");
      el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      el.style.cssText = `
        position: absolute;
        font-size: ${Math.random() * 20 + 16}px;
        left: ${Math.random() * 100}%;
        top: -30px;
        animation: fall ${Math.random() * 2 + 1.5}s ease-in forwards;
        animation-delay: ${Math.random() * 0.8}s;
        pointer-events: none;
      `;
      container.appendChild(el);
      particles.push(el);
    }

    const timer = setTimeout(() => {
      particles.forEach((p) => p.remove());
      onComplete?.();
    }, 3500);

    return () => {
      clearTimeout(timer);
      particles.forEach((p) => p.remove());
    };
  }, [animation]);

  return (
    <>
      <style>{`
        @keyframes fall {
          0%   { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
      <div ref={containerRef} className="fixed inset-0 pointer-events-none z-[200] overflow-hidden" />
    </>
  );
}
