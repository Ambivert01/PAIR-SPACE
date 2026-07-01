import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRelationship } from "../context/RelationshipProvider.jsx";
import { useCurrentUserId } from "../hooks/useCurrentUserId.js";
import {
  listPlans,
  updatePlan,
  deletePlan,
  completeHabit,
} from "../features/planner/plannerService.js";
import PlanCard from "../features/planner/PlanCard.jsx";
import PlanCreateModal from "../features/planner/PlanCreateModal.jsx";
import CalendarView from "../features/planner/CalendarView.jsx";
import HabitTracker from "../features/planner/HabitTracker.jsx";
import ConfirmModal from "../components/ui/ConfirmModal.jsx";

const TABS = ["All", "Habits", "Calendar"];
const STATUS_FILTERS = ["", "pending", "active", "completed"];

export default function PlannerPage() {
  const navigate = useNavigate();
  const currentUserId = useCurrentUserId();

  const { rel, loading: relLoading } = useRelationship();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("All");
  const [statusFilter, setStatusFilter] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);


  useEffect(() => {
    if (!rel) return;
    setLoading(true);
    const params = {};
    if (statusFilter) params.status = statusFilter;
    if (tab === "Habits") params.type = "habit";

    listPlans(rel.id, params)
      .then(({ plans: p }) => setPlans(p))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [rel, tab, statusFilter]);

  const handleComplete = async (planId) => {
    const plan = plans.find((p) => p._id === planId);
    if (!plan) return;
    try {
      if (plan.type === "habit") {
        const { streakCount, longestStreak } = await completeHabit(planId);
        setPlans((prev) =>
          prev.map((p) =>
            p._id === planId ? { ...p, streakCount, longestStreak } : p,
          ),
        );
      } else {
        const updated = await updatePlan(planId, {
          status: "completed",
          progress: 100,
        });
        setPlans((prev) => prev.map((p) => (p._id === planId ? updated : p)));
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed");
    }
  };

  const [deleteTarget, setDeleteTarget] = useState(null);

  const handleDelete = async (planId) => {
    setDeleteTarget(planId);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await deletePlan(deleteTarget);
    setPlans((prev) => prev.filter((p) => p._id !== deleteTarget));
    setDeleteTarget(null);
  };

  const habits = plans.filter((p) => p.type === "habit");
  const dayPlans = selectedDay
    ? plans.filter((p) => {
        const d = p.dueDate || p.startDate;
        return d && new Date(d).toDateString() === selectedDay.toDateString();
      })
    : [];

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-white flex flex-col">
      {/* header */}
      <div className="hstack-md px-4 py-4 border-b border-[var(--glass-border)] sticky top-0 bg-[var(--bg-primary)] z-20">
        <button
          onClick={() => navigate("/relationship")}
          className="text-[var(--text-tertiary)] hover:text-white transition-colors"
        >
          ←
        </button>
        <h1 className="text-base font-semibold flex-1">Planner</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="gradient-mixed hover:bg-[var(--accent-dream)] rounded-xl px-4 py-2 text-xs font-medium transition-colors"
        >
          + Plan
        </button>
      </div>

      {/* tabs */}
      <div className="flex border-b border-[var(--glass-border)]">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => {
              setTab(t);
              setSelectedDay(null);
            }}
            className={`flex-1 py-3 text-sm transition-colors ${
              tab === t
                ? "text-white border-b-2 border-[var(--accent-dream-soft)]"
                : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* status filter (All tab only) */}
      {tab === "All" && (
        <div className="flex gap-2 px-4 py-3 overflow-x-auto border-b border-[var(--glass-border)]">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs border transition-colors capitalize ${
                statusFilter === s
                  ? "border-[var(--accent-dream-soft)] bg-indigo-900/40 text-white"
                  : "border-[var(--glass-border)] text-[var(--text-tertiary)]"
              }`}
            >
              {s || "All"}
            </button>
          ))}
        </div>
      )}

      {/* content */}
      <div className="flex-1 px-4 py-4 space-y-3">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-[var(--accent-dream-soft)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : tab === "Calendar" ? (
          <div className="space-y-4">
            <CalendarView
              plans={plans}
              onDayClick={(day, dp) => setSelectedDay(day)}
            />
            {selectedDay && (
              <div className="space-y-2">
                <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">
                  {selectedDay.toLocaleDateString(undefined, {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                {dayPlans.length === 0 ? (
                  <p className="text-xs text-gray-700">
                    Nothing planned this day.
                  </p>
                ) : (
                  dayPlans.map((p) => (
                    <PlanCard
                      key={p._id}
                      plan={p}
                      onClick={() => {}}
                      onComplete={handleComplete}
                      onDelete={handleDelete}
                    />
                  ))
                )}
              </div>
            )}
          </div>
        ) : tab === "Habits" ? (
          <HabitTracker habits={habits} onComplete={handleComplete} />
        ) : plans.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 stack-md">
            <span className="text-5xl">📅</span>
            <p className="text-[var(--text-tertiary)] text-sm">
              No plans yet. Start organizing your life together.
            </p>
            <button
              onClick={() => setShowCreate(true)}
              className="gradient-mixed hover:bg-[var(--accent-dream)] rounded-xl px-5 py-2.5 text-sm font-medium transition-colors"
            >
              Create first plan
            </button>
          </div>
        ) : (
          plans.map((p) => (
            <PlanCard
              key={p._id}
              plan={p}
              onClick={() => {}}
              onComplete={handleComplete}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {showCreate && rel && (
        <PlanCreateModal
          relationshipId={rel.id}
          onCreated={(p) => setPlans((prev) => [p, ...prev])}
          onClose={() => setShowCreate(false)}
        />
      )}

      <ConfirmModal
        isOpen={!!deleteTarget}
        icon="🗑️"
        title="Delete this plan?"
        description="This can't be undone."
        confirmText="Delete"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
