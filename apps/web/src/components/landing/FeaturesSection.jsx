import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

export default function FeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const features = [
    {
      icon: "💬",
      title: "Real-time Chat",
      description:
        "Stay connected with instant messaging, reactions, and rich media sharing",
    },
    {
      icon: "📸",
      title: "Shared Memories Timeline",
      description:
        "Build your story together with photos, videos, and special moments",
    },
    {
      icon: "🎬",
      title: "Watch & Listen Together",
      description:
        "Enjoy movies, music, and videos in sync, no matter the distance",
    },
    {
      icon: "📅",
      title: "Shared Planner",
      description:
        "Coordinate schedules, plan dates, and track important events together",
    },
    {
      icon: "🎮",
      title: "Fun Games",
      description:
        "Play interactive games designed to bring you closer and create memories",
    },
    {
      icon: "🎁",
      title: "Digital Surprises",
      description:
        "Send thoughtful gifts, letters, and surprises that unlock at special times",
    },
  ];

  return (
    <section ref={ref} className="py-20 px-6 bg-[var(--bg-tertiary)]">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-h1 text-white mb-4">
            Everything you need to stay close
          </h2>
          <p className="text-xl text-[var(--text-secondary)]">
            Designed for couples who want more than just messaging
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="card-glass card-interactive"
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
            >
              <div className="text-5xl mb-4">{feature.icon}</div>
              <h3 className="text-h3 text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-[var(--text-tertiary)] leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
