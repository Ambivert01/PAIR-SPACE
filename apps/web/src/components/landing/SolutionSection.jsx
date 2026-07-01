import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

export default function SolutionSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const features = [
    { icon: "💬", label: "Chat" },
    { icon: "📞", label: "Call" },
    { icon: "📸", label: "Memories" },
    { icon: "🎬", label: "Watch Together" },
    { icon: "🎮", label: "Play Together" },
    { icon: "📅", label: "Plan Together" },
  ];

  return (
    <section
      ref={ref}
      className="py-20 px-6 bg-[var(--bg-secondary)]"
    >
      <div className="max-w-5xl mx-auto text-center">
        <motion.h2
          className="text-h1 text-white mb-6"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          A private <span className="gradient-text-mixed">digital world for two</span>
        </motion.h2>

        <motion.p
          className="text-xl text-[var(--text-secondary)] mb-16 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          All in one shared space
        </motion.p>

        <motion.div
          className="grid grid-cols-2 md:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.label}
              className="card-glass card-interactive"
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <div className="text-5xl mb-4">{feature.icon}</div>
              <p className="text-white font-medium">{feature.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
