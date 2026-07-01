import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

export default function EmotionalSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      ref={ref}
      className="py-32 px-6 bg-[var(--bg-secondary)] relative overflow-hidden"
    >
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: "var(--gradient-radial-ambient)" }} />
      <motion.div
        className="floating-orb floating-orb-dream w-72 h-72 top-1/3 left-1/3"
        animate={{ scale: [1, 1.25, 1] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="floating-orb floating-orb-love w-72 h-72 bottom-1/3 right-1/3"
        animate={{ scale: [1.25, 1, 1.25] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
      />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-hero text-white mb-8">
            It's not about{" "}
            <span className="text-[var(--text-tertiary)] not-italic font-sans font-bold">staying in touch</span>.
            <br />
            It's about <span className="gradient-text-mixed">staying connected</span>.
          </h2>
        </motion.div>

        <motion.p
          className="text-2xl text-[var(--text-secondary)] leading-relaxed"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          Because distance shouldn't mean disconnection
        </motion.p>
      </div>
    </section>
  );
}
