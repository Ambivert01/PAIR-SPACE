/**
 * FloatingOrb Component
 *
 * Ambient background orbs for emotional atmosphere
 */

import { motion } from "framer-motion";

export default function FloatingOrb({
  variant = "love",
  size = "lg",
  position = { top: "20%", left: "20%" },
  delay = 0,
}) {
  const variants = {
    love: "floating-orb-love",
    dream: "floating-orb-dream",
  };

  const sizes = {
    sm: "w-32 h-32",
    md: "w-64 h-64",
    lg: "w-96 h-96",
    xl: "w-[32rem] h-[32rem]",
  };

  return (
    <motion.div
      className={`floating-orb ${variants[variant]} ${sizes[size]}`}
      style={{
        position: "absolute",
        top: position.top,
        left: position.left,
        right: position.right,
        bottom: position.bottom,
      }}
      animate={{
        x: [0, 30, -20, 0],
        y: [0, -30, 20, 0],
        scale: [1, 1.1, 0.9, 1],
      }}
      transition={{
        duration: 20,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
    />
  );
}

// Multiple orbs container
export function FloatingOrbs() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <FloatingOrb
        variant="love"
        size="lg"
        position={{ top: "10%", left: "10%" }}
        delay={0}
      />
      <FloatingOrb
        variant="dream"
        size="xl"
        position={{ top: "60%", right: "10%" }}
        delay={5}
      />
      <FloatingOrb
        variant="love"
        size="md"
        position={{ bottom: "20%", left: "50%" }}
        delay={10}
      />
    </div>
  );
}
