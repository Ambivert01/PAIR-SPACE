import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useRelationship } from "../context/RelationshipProvider.jsx";
import { useCurrentUserId } from "../hooks/useCurrentUserId.js";
import { listGifts } from "../features/gifts/giftService.js";
import GiftCardUltra from "../features/gifts/GiftCardUltra.jsx";
import GiftComposer from "../features/gifts/GiftComposer.jsx";
import GiftRevealModalUltra from "../features/gifts/GiftRevealModalUltra.jsx";

export default function GiftGalleryUltra() {
  const navigate = useNavigate();
  const currentUserId = useCurrentUserId();
  const { rel, loading: relLoading } = useRelationship();
  const [gifts, setGifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showComposer, setShowComposer] = useState(false);
  const [selected, setSelected] = useState(null);


  useEffect(() => {
    if (!rel) return;
    listGifts(rel.id)
      .then(({ gifts: g }) => setGifts(g))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [rel]);

  const updateGift = (updated) =>
    setGifts((prev) => prev.map((g) => (g._id === updated._id ? updated : g)));

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f14] to-[#1c1c24] text-white flex flex-col relative overflow-hidden">
      {/* Header */}
      <motion.div
        className="hstack-md px-6 py-5 border-b border-[var(--glass-border)] sticky top-0 bg-gradient-to-br from-[#0f0f14]/90 to-[#1c1c24]/90 backdrop-blur-xl z-10"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <motion.button
          onClick={() => navigate("/relationship")}
          className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
          whileHover={{ x: -3 }}
          whileTap={{ scale: 0.95 }}
        >
          ←
        </motion.button>
        <h1 className="text-lg font-light flex-1">Gifts & Surprises</h1>
        <motion.button
          onClick={() => setShowComposer(true)}
          className="btn-primary btn-base"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          🎁 Send gift
        </motion.button>
      </motion.div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 relative z-0">
        {loading ? (
          <motion.div
            className="flex justify-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="w-8 h-8 border-2 border-[var(--accent-dream)] border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </motion.div>
        ) : gifts.length === 0 ? (
          <motion.div
            className="stack-md items-center justify-center py-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <motion.span
              className="text-7xl"
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, -5, 5, -5, 0],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              🎁
            </motion.span>
            <p className="text-[var(--text-secondary)] text-base font-light">
              No gifts yet. Send the first one!
            </p>
            <motion.button
              onClick={() => setShowComposer(true)}
              className="btn-primary btn-base mt-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Send a surprise
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: { staggerChildren: 0.08 },
              },
            }}
            initial="hidden"
            animate="show"
          >
            {gifts.map((g) => (
              <GiftCardUltra
                key={g._id}
                gift={g}
                currentUserId={currentUserId}
                onClick={setSelected}
              />
            ))}
          </motion.div>
        )}
      </div>

      {/* Composer */}
      {showComposer && rel && (
        <GiftComposer
          relationshipId={rel.id}
          onSent={(g) => setGifts((prev) => [g, ...prev])}
          onClose={() => setShowComposer(false)}
        />
      )}

      {/* Reveal modal */}
      <AnimatePresence>
        {selected && (
          <GiftRevealModalUltra
            gift={selected}
            currentUserId={currentUserId}
            onClose={() => setSelected(null)}
            onOpened={updateGift}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
