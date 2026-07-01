/**
 * AudioVisualizerUltra Component
 *
 * Premium audio visualizer with glassmorphism and smooth animations
 */

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

export default function AudioVisualizerUltra({ stream, active }) {
  const barsRef = useRef([]);
  const animRef = useRef(null);
  const analyserRef = useRef(null);

  useEffect(() => {
    if (!stream || !active) {
      // Reset bars to minimum height when inactive
      barsRef.current.forEach((bar) => {
        if (bar) bar.style.height = "4px";
      });
      return;
    }

    try {
      const ctx = new AudioContext();
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      src.connect(analyser);
      analyserRef.current = analyser;

      const data = new Uint8Array(analyser.frequencyBinCount);
      const animate = () => {
        analyser.getByteFrequencyData(data);
        barsRef.current.forEach((bar, i) => {
          if (bar) {
            const h = Math.max(4, (data[i * 2] / 255) * 32);
            bar.style.height = `${h}px`;
          }
        });
        animRef.current = requestAnimationFrame(animate);
      };
      animate();

      return () => {
        cancelAnimationFrame(animRef.current);
        ctx.close();
      };
    } catch {
      /* AudioContext not available */
    }
  }, [stream, active]);

  return (
    <motion.div
      className="hstack-sm h-8"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={i}
          ref={(el) => (barsRef.current[i] = el)}
          className="w-1.5 rounded-full transition-all duration-75 shadow-glow-dream"
          style={{
            height: "4px",
            background: active
              ? "linear-gradient(to top, var(--accent-dream), var(--accent-love))"
              : "var(--glass-border)",
          }}
          initial={{ opacity: 0, scaleY: 0 }}
          animate={{ opacity: 1, scaleY: 1 }}
          transition={{ delay: i * 0.05, duration: 0.2 }}
          whileHover={{ scaleX: 1.2 }}
        />
      ))}
    </motion.div>
  );
}
