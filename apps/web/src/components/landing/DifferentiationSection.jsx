import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

export default function DifferentiationSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const differentiators = [
    {
      icon: "🔒",
      title: "Not social media",
      description: "Your private space, just for two. No feeds, no followers.",
    },
    {
      icon: "✨",
      title: "Not just chat",
      description: "Live experiences together, not just text messages.",
    },
    {
      icon: "🧠",
      title: "AI understands emotions",
      description: "Get insights and suggestions that strengthen your bond.",
    },
    {
      icon: "🎯",
      title: "Shared experiences",
      description: "Do things together, even when apart.",
    },
    {
      icon: "💝",
      title: "Private relationship space",
      description: "Built for intimacy, connection, and meaningful moments.",
    },
  ];

  return (
    <section
      ref={ref}
      className="py-20 px-6 bg-[var(--bg-secondary)]"
    >
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-h1 text-white mb-4">
            What makes it <span className="gradient-text-mixed">different?</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {differentiators.map((item, index) => (
            <motion.div
              key={item.title}
              className="card-glass card-interactive"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-4xl mb-3">{item.icon}</div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {item.title}
              </h3>
              <p className="text-[var(--text-tertiary)] text-sm leading-relaxed">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
