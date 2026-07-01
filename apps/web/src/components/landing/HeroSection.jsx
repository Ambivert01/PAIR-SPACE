import { motion } from "framer-motion";

export default function HeroSection({ onGetStarted, onWatchDemo }) {
  return (
    <section className="hero-section relative min-h-screen flex items-center justify-center overflow-hidden bg-[var(--bg-primary)]">
      {/* Ambient gradient background, matching the in-app theme */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: "var(--gradient-radial-ambient)" }} />

      {/* Floating orbs */}
      <motion.div
        className="floating-orb floating-orb-love w-[28rem] h-[28rem] top-1/4 left-1/4"
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="floating-orb floating-orb-dream w-[28rem] h-[28rem] bottom-1/4 right-1/4"
        animate={{ scale: [1.15, 1, 1.15] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-20 text-center">
        <motion.div
          className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-8 text-xs font-medium text-[var(--text-secondary)]"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="animate-heartbeat">💗</span>
          A private world built for two
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <h1 className="text-hero text-white mb-6">
            Not just messaging.
            <br />
            <span className="gradient-text-mixed">A space that feels like home.</span>
          </h1>
        </motion.div>

        <motion.p
          className="text-lg md:text-xl text-[var(--text-secondary)] mb-10 max-w-2xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25 }}
        >
          Memories, calls, journals, and little rituals — all in one place that
          belongs only to the two of you, even when you're miles apart.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <motion.button
            onClick={onGetStarted}
            className="btn-primary btn-base text-base px-8 py-4"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            Start your space 💞
          </motion.button>
          <motion.button
            onClick={onWatchDemo}
            className="btn-secondary btn-base text-base px-8 py-4"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            Watch demo
          </motion.button>
        </motion.div>

        <motion.p
          className="text-small mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          Free to start · No credit card needed
        </motion.p>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <svg className="w-6 h-6 text-[var(--text-tertiary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.div>
      </div>
    </section>
  );
}
