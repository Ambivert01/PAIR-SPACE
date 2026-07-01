import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

export default function CTASection({ onGetStarted }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      ref={ref}
      className="py-32 px-6 bg-[var(--bg-primary)] relative overflow-hidden"
    >
      {/* Ambient background, matching Hero */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: "var(--gradient-radial-ambient)" }} />
      <motion.div
        className="floating-orb floating-orb-love w-96 h-96 top-1/4 left-1/4"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="floating-orb floating-orb-dream w-96 h-96 bottom-1/4 right-1/4"
        animate={{ scale: [1.2, 1, 1.2] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-hero text-white mb-6">
            Start your space today
          </h2>
          <p className="text-xl md:text-2xl text-[var(--text-secondary)] mb-12 max-w-2xl mx-auto">
            Join couples who are building deeper connections, one moment at a
            time
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <motion.button
            onClick={onGetStarted}
            className="btn-primary btn-base text-xl px-12 py-5"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
          >
            Create your space 💞
          </motion.button>
        </motion.div>

        <motion.p
          className="mt-8 text-small"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          Free to start • No credit card required • Set up in minutes
        </motion.p>
      </div>
    </section>
  );
}
