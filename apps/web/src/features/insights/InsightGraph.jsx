export default function InsightGraph({ data = [], label = "Messages", color = "#6366f1" }) {
  if (!data.length) return null;
  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="space-y-2">
      <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">{label}</p>
      <div className="flex items-end gap-1.5 h-20">
        {data.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full rounded-t-sm transition-all duration-500"
              style={{
                height: `${Math.max(4, (d.count / max) * 64)}px`,
                backgroundColor: d.count > 0 ? color : "#1f2937",
              }}
            />
            <span className="text-[9px] text-[var(--text-disabled)]">{d.day}</span>
          </div>
        ))}
      </div>
      <div className="flex justify-between text-xs text-gray-700">
        <span>0</span>
        <span>{max}</span>
      </div>
    </div>
  );
}
