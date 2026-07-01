/**
 * EmojiPickerUltra Component
 *
 * Premium emoji picker with glassmorphism and smooth animations
 */

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fadeIn, scaleIn } from "../../utils/motionPresets.js";

const EMOJIS = [
  "❤️",
  "😍",
  "😘",
  "🥰",
  "😊",
  "😂",
  "🤣",
  "😭",
  "😢",
  "😅",
  "🙏",
  "👍",
  "👎",
  "🔥",
  "✨",
  "💫",
  "🎉",
  "🎊",
  "💕",
  "💞",
  "😴",
  "🤔",
  "😏",
  "😒",
  "🙄",
  "😤",
  "😡",
  "🥺",
  "😳",
  "🤗",
  "👋",
  "🤝",
  "💪",
  "🫂",
  "💋",
  "😇",
  "🤩",
  "😎",
  "🥳",
  "😬",
];

export default function EmojiPickerUltra({ onSelect, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (!ref.current?.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        ref={ref}
        className="absolute bottom-full mb-2 left-0 card-glass shadow-2xl z-50 w-64"
        {...scaleIn}
        exit={{ opacity: 0, scale: 0.9, y: 10 }}
      >
        <div className="grid grid-cols-8 gap-1">
          {EMOJIS.map((emoji, index) => (
            <motion.button
              key={emoji}
              onClick={() => {
                onSelect(emoji);
                onClose();
              }}
              className="text-xl hover:bg-white/10 rounded-lg p-1 transition-all duration-200 hover:scale-110 active:scale-95"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.01, duration: 0.2 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {emoji}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
