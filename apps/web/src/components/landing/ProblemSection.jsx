import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

export default function ProblemSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-20 px-6 bg-[var(--bg-primary)]">
      <div className="max-w-4xl mx-auto text-center">
        <motion.h2
          className="text-h1 text-white mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          Distance creates gaps
        </motion.h2>

        <motion.p
          className="text-xl text-[var(--text-secondary)] mb-12 leading-relaxed"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Not just in communication, but in{" "}
          <span className="text-[var(--accent-love-soft)] font-semibold">
            shared experiences
          </span>
          .
        </motion.p>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="card-glass">
            <div className="text-4xl mb-3">💬</div>
            <p className="text-[var(--text-secondary)]">Chat</p>
          </div>
          <div className="card-glass">
            <div className="text-4xl mb-3">📞</div>
            <p className="text-[var(--text-secondary)]">Call</p>
          </div>
          <div className="card-glass">
            <div className="text-4xl mb-3">📱</div>
            <p className="text-[var(--text-secondary)]">Scroll</p>
          </div>
        </motion.div>

        <motion.p
          className="text-lg text-[var(--text-tertiary)] italic"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          But they don't help people{" "}
          <span className="text-[var(--accent-dream-soft)] font-semibold">
            live together digitally
          </span>
          .
        </motion.p>
      </div>
    </section>
  );
}
