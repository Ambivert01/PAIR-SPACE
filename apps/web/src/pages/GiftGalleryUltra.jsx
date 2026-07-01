import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRelationship } from "../context/RelationshipProvider.jsx";
import { useCurrentUserId } from "../hooks/useCurrentUserId.js";
import { listGifts } from "../features/gifts/giftService.js";
import GiftCardUltra from "../features/gifts/GiftCardUltra.jsx";
import GiftComposer from "../features/gifts/GiftComposer.jsx";
import GiftRevealModalUltra from "../features/gifts/GiftRevealModalUltra.jsx";
import PageLayout, { PageSpinner, PageEmpty, HeaderButton } from "../components/PageLayout.jsx";

export default function GiftGalleryUltra() {
  const currentUserId = useCurrentUserId();
  const { rel } = useRelationship();
  const [gifts, setGifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showComposer, setShowComposer] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!rel) return;
    listGifts(rel.id).then(({ gifts: g }) => setGifts(g)).catch(() => {}).finally(() => setLoading(false));
  }, [rel]);

  const updateGift = (updated) => setGifts(prev => prev.map(g => g._id === updated._id ? updated : g));

  return (
    <PageLayout
      title="Gifts & Surprises"
      subtitle="Send something special"
      icon="🎁"
      accent="love"
      headerRight={<HeaderButton onClick={() => setShowComposer(true)}>🎁 Send gift</HeaderButton>}
    >
      <div className="overflow-y-auto px-4 py-5">
        {loading ? <PageSpinner label="Loading gifts..." /> :
         gifts.length === 0 ? (
          <PageEmpty icon="🎁" title="No gifts yet" desc="Send the first surprise to your partner!" action="Send a surprise" onAction={() => setShowComposer(true)} />
         ) : (
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 gap-4" variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } }} initial="hidden" animate="show">
            {gifts.map(g => <GiftCardUltra key={g._id} gift={g} currentUserId={currentUserId} onClick={setSelected} />)}
          </motion.div>
         )}
      </div>

      {showComposer && rel && <GiftComposer relationshipId={rel.id} onSent={g => setGifts(prev => [g, ...prev])} onClose={() => setShowComposer(false)} />}

      <AnimatePresence>
        {selected && <GiftRevealModalUltra gift={selected} currentUserId={currentUserId} onClose={() => setSelected(null)} onOpened={updateGift} />}
      </AnimatePresence>
    </PageLayout>
  );
}
