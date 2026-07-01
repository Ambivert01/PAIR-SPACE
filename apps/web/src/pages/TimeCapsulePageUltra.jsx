import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useRelationship } from "../context/RelationshipProvider.jsx";
import { useCurrentUserId } from "../hooks/useCurrentUserId.js";
import { listCapsules } from "../features/timecapsule/capsuleService.js";
import CapsuleCardUltra from "../features/timecapsule/CapsuleCardUltra.jsx";
import CapsuleComposer from "../features/timecapsule/CapsuleComposer.jsx";
import CapsuleRevealModalUltra from "../features/timecapsule/CapsuleRevealModalUltra.jsx";

export default function TimeCapsulePageUltra() {
  const navigate = useNavigate();
  const currentUserId = useCurrentUserId();
  const { rel, loading: relLoading } = useRelationship();
  const [capsules, setCapsules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showComposer, setShowComposer] = useState(false);
  const [selected, setSelected] = useState(null);


  useEffect(() => {
    if (!rel) return;
    listCapsules(rel.id)
      .then(({ capsules: c }) => setCapsules(c))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [rel]);

  const updateCapsule = (updated) =>
    setCapsules((prev) =>
      prev.map((c) =>
        c._id === updated._id ? { ...updated, visibilityState: "opened" } : c,
      ),
    );

  const ready = capsules.filter((c) => c.visibilityState === "ready_to_open");
  const active = capsules.filter((c) =>
    ["locked", "countdown_active"].includes(c.visibilityState),
  );
  const opened = capsules.filter((c) => c.visibilityState === "opened");

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
        <h1 className="text-lg font-light flex-1">Time Capsules</h1>
        <motion.button
          onClick={() => setShowComposer(true)}
          className="btn-primary btn-base"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          🔒 Create capsule
        </motion.button>
      </motion.div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 relative z-0">
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
        ) : capsules.length === 0 ? (
          <motion.div
            className="stack-md items-center justify-center py-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <motion.span
              className="text-7xl"
              animate={{
                scale: [1, 1.05, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              ⏳
            </motion.span>
            <p className="text-[var(--text-secondary)] text-base font-light text-center">
              No time capsules yet.
            </p>
            <p className="text-[var(--text-tertiary)] text-sm text-center">
              Send a message into the future.
            </p>
            <motion.button
              onClick={() => setShowComposer(true)}
              className="btn-primary btn-base mt-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Create first capsule
            </motion.button>
          </motion.div>
        ) : (
          <>
            {/* Ready to open */}
            {ready.length > 0 && (
              <motion.div
                className="stack-md"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <motion.p
                  className="text-xs text-[var(--status-success)] uppercase tracking-wider font-light hstack-sm"
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  🎁 Ready to open
                </motion.p>
                <motion.div
                  className="space-y-3"
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
                  {ready.map((c) => (
                    <CapsuleCardUltra
                      key={c._id}
                      capsule={c}
                      currentUserId={currentUserId}
                      onClick={setSelected}
                    />
                  ))}
                </motion.div>
              </motion.div>
            )}

            {/* Sealed */}
            {active.length > 0 && (
              <motion.div
                className="stack-md"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider font-light">
                  ⏳ Sealed
                </p>
                <motion.div
                  className="space-y-3"
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
                  {active.map((c) => (
                    <CapsuleCardUltra
                      key={c._id}
                      capsule={c}
                      currentUserId={currentUserId}
                      onClick={setSelected}
                    />
                  ))}
                </motion.div>
              </motion.div>
            )}

            {/* Opened */}
            {opened.length > 0 && (
              <motion.div
                className="stack-md"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider font-light">
                  💌 Opened
                </p>
                <motion.div
                  className="space-y-3"
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
                  {opened.map((c) => (
                    <CapsuleCardUltra
                      key={c._id}
                      capsule={c}
                      currentUserId={currentUserId}
                      onClick={setSelected}
                    />
                  ))}
                </motion.div>
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* Composer */}
      {showComposer && rel && (
        <CapsuleComposer
          relationshipId={rel.id}
          onCreated={(c) => setCapsules((prev) => [c, ...prev])}
          onClose={() => setShowComposer(false)}
        />
      )}

      {/* Reveal modal */}
      <AnimatePresence>
        {selected && (
          <CapsuleRevealModalUltra
            capsule={selected}
            currentUserId={currentUserId}
            onClose={() => setSelected(null)}
            onOpened={updateCapsule}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
