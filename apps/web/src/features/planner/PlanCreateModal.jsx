import { useState } from "react";
import { createPlan } from "./plannerService.js";
import ReminderSettings from "./ReminderSettings.jsx";

const TYPES = [
  { value: "event",          emoji: "📅", label: "Event"       },
  { value: "reminder",       emoji: "⏰", label: "Reminder"    },
  { value: "goal",           emoji: "🎯", label: "Goal"        },
  { value: "habit",          emoji: "🔥", label: "Habit"       },
  { value: "routine",        emoji: "🔄", label: "Routine"     },
  { value: "task",           emoji: "✅", label: "Task"        },
  { value: "trip_plan",      emoji: "✈️", label: "Trip"        },
  { value: "study_plan",     emoji: "📚", label: "Study Plan"  },
  { value: "health_plan",    emoji: "💪", label: "Health Plan" },
  { value: "milestone_plan", emoji: "🏁", label: "Milestone"   },
  { value: "custom_plan",    emoji: "💫", label: "Custom"      },
];

const PRIORITIES = ["low","medium","high","important"];
const RECURRENCES = ["none","daily","weekly","monthly","yearly"];

export default function PlanCreateModal({ relationshipId, onCreated, onClose }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    type: "", title: "", description: "", priority: "medium",
    startDate: "", endDate: "", dueDate: "", recurrence: "none",
    tags: "", checklist: "",
    reminderSettings: { enabled: false, reminderTimes: [] },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return setError("Title required");
    setLoading(true); setError("");
    try {
      const checklist = form.checklist
        ? form.checklist.split("\n").filter(Boolean).map((t) => ({ text: t.trim(), completed: false }))
        : [];
      const tags = form.tags.split(",").map((t) => t.trim()).filter(Boolean);

      const plan = await createPlan({
        relationshipId, type: form.type, title: form.title,
        description: form.description, priority: form.priority,
        startDate: form.startDate || undefined,
        endDate:   form.endDate   || undefined,
        dueDate:   form.dueDate   || undefined,
        recurrence: form.recurrence,
        tags, checklist,
        reminderSettings: form.reminderSettings,
      });
      onCreated(plan);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create");
    } finally {
      setLoading(false);
    }
  };

  const selectedType = TYPES.find((t) => t.value === form.type);
  const needsChecklist = ["trip_plan","study_plan","health_plan","milestone_plan"].includes(form.type);
  const needsRecurrence = ["habit","routine","reminder"].includes(form.type);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-[var(--glass-bg)] rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">

        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--glass-border)] sticky top-0 bg-[var(--glass-bg)] z-10">
          <div className="flex items-center gap-3">
            {step === 2 && <button onClick={() => setStep(1)} className="text-[var(--text-tertiary)] hover:text-white">←</button>}
            <p className="text-sm font-medium text-white">
              {step === 1 ? "What are you planning?" : `New ${selectedType?.label}`}
            </p>
          </div>
          <button onClick={onClose} className="text-[var(--text-tertiary)] hover:text-white text-xl">×</button>
        </div>

        {step === 1 ? (
          <div className="p-5 grid grid-cols-3 gap-3">
            {TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => { set("type", t.value); setStep(2); }}
                className="flex flex-col items-center gap-2 p-3 rounded-xl border border-[var(--glass-border)] hover:border-[var(--accent-dream-soft)] hover:bg-indigo-900/20 transition-all"
              >
                <span className="text-2xl">{t.emoji}</span>
                <span className="text-xs text-[var(--text-secondary)]">{t.label}</span>
              </button>
            ))}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Title *"
              required
              maxLength={120}
              className="w-full bg-[var(--glass-bg-strong)] border border-[var(--glass-border)] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-[var(--accent-dream-soft)]"
            />

            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Description (optional)"
              rows={2}
              maxLength={1000}
              className="w-full bg-[var(--glass-bg-strong)] border border-[var(--glass-border)] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-[var(--accent-dream-soft)] resize-none"
            />

            {/* priority */}
            <div className="flex gap-2">
              {PRIORITIES.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => set("priority", p)}
                  className={`flex-1 py-1.5 rounded-lg text-xs border transition-colors capitalize ${
                    form.priority === p ? "border-[var(--accent-dream-soft)] bg-indigo-900/30 text-white" : "border-[var(--glass-border)] text-[var(--text-tertiary)]"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* dates */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-[var(--text-disabled)] mb-1">Start date</p>
                <input type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)}
                  className="w-full bg-[var(--glass-bg-strong)] border border-[var(--glass-border)] rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-[var(--accent-dream-soft)]" />
              </div>
              <div>
                <p className="text-xs text-[var(--text-disabled)] mb-1">Due date</p>
                <input type="date" value={form.dueDate} onChange={(e) => set("dueDate", e.target.value)}
                  className="w-full bg-[var(--glass-bg-strong)] border border-[var(--glass-border)] rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-[var(--accent-dream-soft)]" />
              </div>
            </div>

            {/* recurrence */}
            {needsRecurrence && (
              <div>
                <p className="text-xs text-[var(--text-disabled)] mb-1">Repeat</p>
                <select value={form.recurrence} onChange={(e) => set("recurrence", e.target.value)}
                  className="w-full bg-[var(--glass-bg-strong)] border border-[var(--glass-border)] rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[var(--accent-dream-soft)]">
                  {RECURRENCES.map((r) => <option key={r} value={r} className="capitalize">{r}</option>)}
                </select>
              </div>
            )}

            {/* checklist */}
            {needsChecklist && (
              <div>
                <p className="text-xs text-[var(--text-disabled)] mb-1">Checklist (one item per line)</p>
                <textarea
                  value={form.checklist}
                  onChange={(e) => set("checklist", e.target.value)}
                  placeholder={"Pack bags\nBook hotel\nBuy tickets"}
                  rows={3}
                  className="w-full bg-[var(--glass-bg-strong)] border border-[var(--glass-border)] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-[var(--accent-dream-soft)] resize-none"
                />
              </div>
            )}

            {/* tags */}
            <input
              value={form.tags}
              onChange={(e) => set("tags", e.target.value)}
              placeholder="Tags: vacation, exam, health (comma separated)"
              className="w-full bg-[var(--glass-bg-strong)] border border-[var(--glass-border)] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-[var(--accent-dream-soft)]"
            />

            {/* reminder */}
            <div className="bg-[var(--glass-bg-strong)]/50 rounded-xl p-4">
              <p className="text-xs text-[var(--text-tertiary)] mb-3 uppercase tracking-wider">Reminder</p>
              <ReminderSettings
                value={form.reminderSettings}
                onChange={(v) => set("reminderSettings", v)}
              />
            </div>

            {error && <p className="text-[var(--status-error)] text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full gradient-mixed hover:bg-[var(--accent-dream)] disabled:opacity-50 rounded-xl py-3 text-sm font-medium transition-colors"
            >
              {loading ? "Creating..." : `Create ${selectedType?.label}`}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
