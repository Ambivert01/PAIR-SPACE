import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

export default function DemoSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="demo"
      ref={ref}
      className="py-20 px-6 bg-[var(--bg-secondary)]"
    >
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-h1 text-white mb-4">
            See it in action
          </h2>
          <p className="text-xl text-[var(--text-secondary)]">
            Experience how PairSpace brings couples closer
          </p>
        </motion.div>

        <motion.div
          className="relative rounded-3xl overflow-hidden shadow-strong glass-border"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* Demo placeholder - replace with actual screenshots or video */}
          <div className="aspect-video bg-[var(--bg-tertiary)] flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">🎬</div>
              <p className="text-[var(--text-tertiary)] text-lg">
                Demo video or screenshots coming soon
              </p>
              <p className="text-[var(--text-disabled)] text-sm mt-2">
                Showcase key features: chat, memories, activities, and more
              </p>
            </div>
          </div>

          {/* Feature highlights overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[var(--bg-primary)] to-transparent p-8">
            <div className="flex flex-wrap gap-3 justify-center">
              {[
                "Real-time Chat",
                "Shared Memories",
                "Watch Together",
                "Games",
                "AI Insights",
              ].map((feature) => (
                <span
                  key={feature}
                  className="px-4 py-2 glass rounded-full text-sm text-[var(--text-secondary)]"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Additional screenshots grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {[
            { icon: "💬", label: "Chat Interface" },
            { icon: "📸", label: "Memory Timeline" },
            { icon: "🎮", label: "Games Hub" },
          ].map((item, index) => (
            <div
              key={item.label}
              className="aspect-video card-glass card-interactive flex items-center justify-center"
            >
              <div className="text-center">
                <div className="text-4xl mb-2">{item.icon}</div>
                <p className="text-[var(--text-tertiary)] text-sm">{item.label}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
