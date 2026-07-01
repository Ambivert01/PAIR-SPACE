import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRelationship } from "../context/RelationshipProvider.jsx";
import { useCurrentUserId } from "../hooks/useCurrentUserId.js";
import { listCapsules } from "../features/timecapsule/capsuleService.js";
import CapsuleCardUltra from "../features/timecapsule/CapsuleCardUltra.jsx";
import CapsuleComposer from "../features/timecapsule/CapsuleComposer.jsx";
import CapsuleRevealModalUltra from "../features/timecapsule/CapsuleRevealModalUltra.jsx";
import PageLayout, { PageSpinner, PageEmpty, HeaderButton, SectionLabel } from "../components/PageLayout.jsx";

export default function TimeCapsulePageUltra() {
  const currentUserId = useCurrentUserId();
  const { rel } = useRelationship();
  const [capsules, setCapsules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showComposer, setShowComposer] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!rel) return;
    listCapsules(rel.id).then(({ capsules: c }) => setCapsules(c)).catch(() => {}).finally(() => setLoading(false));
  }, [rel]);

  const updateCapsule = (updated) => setCapsules(prev => prev.map(c => c._id === updated._id ? { ...updated, visibilityState: "opened" } : c));

  const ready  = capsules.filter(c => c.visibilityState === "ready_to_open");
  const active = capsules.filter(c => ["locked","countdown_active"].includes(c.visibilityState));
  const opened = capsules.filter(c => c.visibilityState === "opened");

  return (
    <PageLayout
      title="Time Capsules"
      subtitle="Messages from the past & future"
      icon="⏳"
      accent="glow"
      headerRight={<HeaderButton onClick={() => setShowComposer(true)}>🔒 Create capsule</HeaderButton>}
    >
      <div className="overflow-y-auto px-4 py-5 space-y-7">
        {loading ? <PageSpinner label="Loading capsules..." /> :
         capsules.length === 0 ? (
          <PageEmpty icon="⏳" title="No time capsules yet" desc="Send a message into the future. Lock it until a special date." action="Create first capsule" onAction={() => setShowComposer(true)} />
         ) : (
          <>
            {ready.length > 0 && (
              <motion.div className="space-y-3" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-center gap-2">
                  <motion.span className="text-sm" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>🎁</motion.span>
                  <SectionLabel className="text-[var(--status-success)]">Ready to open</SectionLabel>
                </div>
                <div className="space-y-3">
                  {ready.map(c => <CapsuleCardUltra key={c._id} capsule={c} currentUserId={currentUserId} onClick={setSelected} />)}
                </div>
              </motion.div>
            )}
            {active.length > 0 && (
              <motion.div className="space-y-3" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                <SectionLabel>⏳ Sealed</SectionLabel>
                <div className="space-y-3">
                  {active.map(c => <CapsuleCardUltra key={c._id} capsule={c} currentUserId={currentUserId} onClick={setSelected} />)}
                </div>
              </motion.div>
            )}
            {opened.length > 0 && (
              <motion.div className="space-y-3" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <SectionLabel>💌 Opened</SectionLabel>
                <div className="space-y-3">
                  {opened.map(c => <CapsuleCardUltra key={c._id} capsule={c} currentUserId={currentUserId} onClick={setSelected} />)}
                </div>
              </motion.div>
            )}
          </>
         )}
      </div>

      {showComposer && rel && <CapsuleComposer relationshipId={rel.id} onCreated={c => setCapsules(prev => [c, ...prev])} onClose={() => setShowComposer(false)} />}

      <AnimatePresence>
        {selected && <CapsuleRevealModalUltra capsule={selected} currentUserId={currentUserId} onClose={() => setSelected(null)} onOpened={updateCapsule} />}
      </AnimatePresence>
    </PageLayout>
  );
}
