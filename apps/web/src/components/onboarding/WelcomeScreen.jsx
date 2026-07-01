import { motion } from "framer-motion";

export default function WelcomeScreen({ onStart }) {
  const features = [
    { emoji: "💬", title: "Private Chat",     desc: "Just the two of you" },
    { emoji: "📸", title: "Shared Memories",  desc: "Your timeline together" },
    { emoji: "🎮", title: "Fun Activities",   desc: "Watch, play & focus together" },
    { emoji: "💗", title: "Stay Connected",   desc: "Even across the distance" },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] relative overflow-hidden p-4">
      <div className="floating-orb floating-orb-love w-80 h-80 -top-20 -left-20" />
      <div className="floating-orb floating-orb-dream w-80 h-80 bottom-0 -right-20" style={{ animationDelay: "4s" }} />

      <motion.div
        className="max-w-sm w-full text-center space-y-8 relative z-10"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Logo */}
        <motion.div
          className="flex justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
        >
          <div className="w-20 h-20 rounded-full gradient-mixed flex items-center justify-center text-4xl shadow-glow-love animate-pulse-glow">
            💞
          </div>
        </motion.div>

        <div className="space-y-3">
          <h1 className="text-hero text-white">
            Your private space
          </h1>
          <p className="text-[var(--text-secondary)] text-lg leading-relaxed">
            A beautiful world for two — share moments, memories, and stay close no matter the distance.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              className="card-glass text-left"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.08 }}
            >
              <div className="text-2xl mb-2">{f.emoji}</div>
              <p className="text-sm font-semibold text-white">{f.title}</p>
              <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{f.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.button
          onClick={onStart}
          className="w-full btn-primary btn-base text-base"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          Get started ✨
        </motion.button>

        <div className="flex items-center justify-center gap-6 text-xs text-[var(--text-disabled)]">
          <span>🔒 Private & Secure</span>
          <span>🚫 No Ads</span>
          <span>💝 Made for Two</span>
        </div>
      </motion.div>
    </div>
  );
}
