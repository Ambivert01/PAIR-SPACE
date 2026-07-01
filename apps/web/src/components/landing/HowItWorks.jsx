import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

export default function HowItWorks() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const steps = [
    {
      number: "1",
      icon: "🚀",
      title: "Create your space",
      description:
        "Sign up and set up your private relationship space in minutes",
    },
    {
      number: "2",
      icon: "💌",
      title: "Invite your partner",
      description:
        "Send a secure invite link to your partner to join your space",
    },
    {
      number: "3",
      icon: "❤️",
      title: "Start sharing life together",
      description:
        "Chat, create memories, play games, and stay connected every day",
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
            How it works
          </h2>
          <p className="text-xl text-[var(--text-secondary)]">
            Get started in three simple steps
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connection line (desktop only) */}
          <div className="hidden md:block absolute top-8 left-0 right-0 h-0.5 gradient-mixed opacity-30" />

          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              className="relative"
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              {/* Step number badge */}
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full gradient-mixed flex items-center justify-center text-white text-2xl font-bold shadow-glow-love relative z-10">
                  {step.number}
                </div>
              </div>

              {/* Content card */}
              <motion.div
                className="card-glass text-center"
                whileHover={{ y: -5, scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-5xl mb-4">{step.icon}</div>
                <h3 className="text-h3 text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-[var(--text-tertiary)] leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
