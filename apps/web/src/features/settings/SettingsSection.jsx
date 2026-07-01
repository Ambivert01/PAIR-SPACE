export default function SettingsSection({ title, description, children }) {
  return (
    <div className="space-y-1">
      <div className="px-1 mb-3">
        <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider font-medium">{title}</p>
        {description && <p className="text-xs text-gray-700 mt-0.5">{description}</p>}
      </div>
      <div className="bg-[var(--glass-bg)] rounded-2xl overflow-hidden divide-y divide-gray-800 px-4">
        {children}
      </div>
    </div>
  );
}
