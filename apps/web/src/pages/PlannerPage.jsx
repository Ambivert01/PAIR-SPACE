import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRelationship } from "../context/RelationshipProvider.jsx";
import { useCurrentUserId } from "../hooks/useCurrentUserId.js";
import { listPlans, updatePlan, deletePlan, completeHabit } from "../features/planner/plannerService.js";
import PlanCard from "../features/planner/PlanCard.jsx";
import PlanCreateModal from "../features/planner/PlanCreateModal.jsx";
import CalendarView from "../features/planner/CalendarView.jsx";
import HabitTracker from "../features/planner/HabitTracker.jsx";
import ConfirmModal from "../components/ui/ConfirmModal.jsx";
import PageLayout, { PageSpinner, PageEmpty, HeaderButton, SectionLabel } from "../components/PageLayout.jsx";

const TABS = ["All", "Habits", "Calendar"];
const STATUS_FILTERS = ["", "pending", "active", "completed"];

export default function PlannerPage() {
  const currentUserId = useCurrentUserId();
  const { rel } = useRelationship();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("All");
  const [statusFilter, setStatusFilter] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    if (!rel) return;
    setLoading(true);
    const params = {};
    if (statusFilter) params.status = statusFilter;
    if (tab === "Habits") params.type = "habit";
    listPlans(rel.id, params).then(({ plans: p }) => setPlans(p)).catch(() => {}).finally(() => setLoading(false));
  }, [rel, tab, statusFilter]);

  const handleComplete = async (planId) => {
    const plan = plans.find(p => p._id === planId);
    if (!plan) return;
    try {
      if (plan.type === "habit") {
        const { streakCount, longestStreak } = await completeHabit(planId);
        setPlans(prev => prev.map(p => p._id === planId ? { ...p, streakCount, longestStreak } : p));
      } else {
        const updated = await updatePlan(planId, { status: "completed", progress: 100 });
        setPlans(prev => prev.map(p => p._id === planId ? updated : p));
      }
    } catch (err) { alert(err.response?.data?.message || "Failed"); }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await deletePlan(deleteTarget);
    setPlans(prev => prev.filter(p => p._id !== deleteTarget));
    setDeleteTarget(null);
  };

  const habits = plans.filter(p => p.type === "habit");
  const dayPlans = selectedDay ? plans.filter(p => { const d = p.dueDate || p.startDate; return d && new Date(d).toDateString() === selectedDay.toDateString(); }) : [];

  return (
    <PageLayout
      title="Planner"
      subtitle="Habits, goals & events"
      icon="📅"
      accent="glow"
      headerRight={<HeaderButton onClick={() => setShowCreate(true)}>+ Plan</HeaderButton>}
      noPad
    >
      <div className="flex flex-col h-[calc(100vh-64px)]">
        {/* Tabs */}
        <div className="flex border-b border-[var(--glass-border)] bg-[var(--bg-primary)]/80 backdrop-blur-sm">
          {TABS.map(t => (
            <button key={t} onClick={() => { setTab(t); setSelectedDay(null); }}
              className={`flex-1 py-3 text-sm font-medium transition-all relative ${tab === t ? "text-white" : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"}`}>
              {t}
              {tab === t && <motion.div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[var(--accent-glow)] to-[var(--accent-dream)]" layoutId="planner-tab" />}
            </button>
          ))}
        </div>

        {/* Status filter */}
        {tab === "All" && (
          <div className="flex gap-2 px-4 py-3 overflow-x-auto border-b border-[var(--glass-border)]" style={{ scrollbarWidth: "none" }}>
            {STATUS_FILTERS.map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all capitalize ${statusFilter === s ? "border-[var(--accent-glow)] bg-[var(--accent-glow)]/15 text-white" : "border-[var(--glass-border)] text-[var(--text-tertiary)] hover:border-[var(--glass-border-strong)]"}`}>
                {s || "All"}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {loading ? <PageSpinner label="Loading plans..." /> :
           tab === "Calendar" ? (
            <div className="space-y-4">
              <CalendarView plans={plans} onDayClick={(day) => setSelectedDay(day)} />
              {selectedDay && (
                <div className="space-y-2">
                  <SectionLabel>{selectedDay.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</SectionLabel>
                  {dayPlans.length === 0 ? <p className="text-xs text-[var(--text-tertiary)] py-4 text-center">Nothing planned this day.</p> :
                    dayPlans.map(p => <PlanCard key={p._id} plan={p} onClick={() => {}} onComplete={handleComplete} onDelete={setDeleteTarget} />)}
                </div>
              )}
            </div>
           ) : tab === "Habits" ? (
            <HabitTracker habits={habits} onComplete={handleComplete} />
           ) : plans.length === 0 ? (
            <PageEmpty icon="📅" title="No plans yet" desc="Start organizing your life together." action="Create first plan" onAction={() => setShowCreate(true)} />
           ) : (
            plans.map(p => <PlanCard key={p._id} plan={p} onClick={() => {}} onComplete={handleComplete} onDelete={setDeleteTarget} />)
           )}
        </div>
      </div>

      {showCreate && rel && <PlanCreateModal relationshipId={rel.id} onCreated={p => setPlans(prev => [p, ...prev])} onClose={() => setShowCreate(false)} />}
      <ConfirmModal isOpen={!!deleteTarget} icon="🗑️" title="Delete this plan?" description="This can't be undone." confirmText="Delete" danger onConfirm={confirmDelete} onCancel={() => setDeleteTarget(null)} />
    </PageLayout>
  );
}
