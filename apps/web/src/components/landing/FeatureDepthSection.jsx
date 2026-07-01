import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

export default function FeatureDepthSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const advancedFeatures = [
    {
      icon: "🧠",
      title: "AI Insights",
      description:
        "Understand your relationship patterns and get personalized suggestions",
      gradient: "from-purple-500 to-indigo-500",
    },
    {
      icon: "📖",
      title: "Relationship Story",
      description: "Automatically generated timeline of your journey together",
      gradient: "from-pink-500 to-rose-500",
    },
    {
      icon: "⏰",
      title: "Time Capsules",
      description:
        "Send messages to the future and unlock memories at special times",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: "✍️",
      title: "Shared Journal",
      description: "Reflect together with prompts and private entries",
      gradient: "from-amber-500 to-orange-500",
    },
    {
      icon: "📱",
      title: "Offline Sync",
      description:
        "Stay connected even without internet, syncs when you're back online",
      gradient: "from-green-500 to-emerald-500",
    },
  ];

  return (
    <section ref={ref} className="py-20 px-6 bg-[var(--bg-primary)]">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-h1 text-white mb-4">
            Built for the long run
          </h2>
          <p className="text-xl text-[var(--text-secondary)]">
            Advanced features that grow with your relationship
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {advancedFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="group relative card-glass overflow-hidden"
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              {/* Gradient overlay on hover */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
              />

              <div className="relative z-10">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-[var(--text-tertiary)] text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
