import { useState } from "react";

export default function CalendarView({ plans, onDayClick }) {
  const [current, setCurrent] = useState(new Date());

  const year  = current.getFullYear();
  const month = current.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthName = current.toLocaleDateString(undefined, { month: "long", year: "numeric" });

  // build date → plans map
  const planMap = {};
  plans.forEach((p) => {
    const d = p.dueDate || p.startDate;
    if (!d) return;
    const key = new Date(d).toDateString();
    if (!planMap[key]) planMap[key] = [];
    planMap[key].push(p);
  });

  const today = new Date().toDateString();

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const prev = () => setCurrent(new Date(year, month - 1, 1));
  const next = () => setCurrent(new Date(year, month + 1, 1));

  return (
    <div className="bg-[var(--glass-bg)] rounded-2xl overflow-hidden">
      {/* header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--glass-border)]">
        <button onClick={prev} className="text-[var(--text-tertiary)] hover:text-white px-2">‹</button>
        <p className="text-sm font-medium text-white">{monthName}</p>
        <button onClick={next} className="text-[var(--text-tertiary)] hover:text-white px-2">›</button>
      </div>

      {/* day labels */}
      <div className="grid grid-cols-7 text-center py-2">
        {["Su","Mo","Tu","We","Th","Fr","Sa"].map((d) => (
          <p key={d} className="text-xs text-[var(--text-disabled)]">{d}</p>
        ))}
      </div>

      {/* cells */}
      <div className="grid grid-cols-7 gap-px px-2 pb-3">
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} />;
          const dateKey = new Date(year, month, day).toDateString();
          const dayPlans = planMap[dateKey] || [];
          const isToday = dateKey === today;

          return (
            <button
              key={day}
              onClick={() => onDayClick?.(new Date(year, month, day), dayPlans)}
              className={`relative flex flex-col items-center py-1.5 rounded-xl transition-colors ${
                isToday ? "gradient-mixed text-white" : "hover:bg-[var(--glass-bg-strong)] text-[var(--text-secondary)]"
              }`}
            >
              <span className="text-xs">{day}</span>
              {dayPlans.length > 0 && (
                <div className="flex gap-0.5 mt-0.5">
                  {dayPlans.slice(0, 3).map((_, idx) => (
                    <span key={idx} className={`w-1 h-1 rounded-full ${isToday ? "bg-white" : "bg-indigo-400"}`} />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
