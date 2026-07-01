import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useRelationship } from "../context/RelationshipProvider.jsx";
import { logout } from "../services/auth/authService.js";
import { endRelationship } from "../services/relationship/relationshipService.js";
import { useSettings } from "../features/settings/useSettings.js";
import { getRelationshipSettings, updateRelationshipSettings } from "../features/settings/settingsService.js";
import SettingsSection from "../features/settings/SettingsSection.jsx";
import ToggleSwitch from "../features/settings/ToggleSwitch.jsx";
import ThemeSelector from "../features/settings/ThemeSelector.jsx";
import PrivacyControls from "../features/settings/PrivacyControls.jsx";
import NotificationControls from "../features/settings/NotificationControls.jsx";
import AIControls from "../features/settings/AIControls.jsx";
import PrivacySettings from "../features/privacy/PrivacySettings.jsx";
import PluginManager from "../features/plugins/PluginManager.jsx";
import ConfirmModal from "../components/ui/ConfirmModal.jsx";
import PageLayout, { PageSpinner } from "../components/PageLayout.jsx";

const NAV = [
  { id: "appearance",    label: "Appearance",    emoji: "🎨" },
  { id: "privacy",       label: "Privacy",       emoji: "🔒" },
  { id: "notifications", label: "Notifications", emoji: "🔔" },
  { id: "ai",            label: "AI",            emoji: "✨" },
  { id: "chat",          label: "Chat",          emoji: "💬" },
  { id: "calls",         label: "Calls",         emoji: "📞" },
  { id: "relationship",  label: "Relationship",  emoji: "❤️" },
  { id: "security",      label: "Security",      emoji: "🛡️" },
  { id: "plugins",       label: "Plugins",       emoji: "🔌" },
  { id: "data",          label: "Data",          emoji: "🗄️" },
];

export default function SettingsPage() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("appearance");
  const [showEndRelConfirm, setShowEndRelConfirm] = useState(false);
  const { rel } = useRelationship();
  const [relSettings, setRelSettings] = useState(null);
  const [saved, setSaved] = useState(false);
  const { settings, loading, update } = useSettings();

  const handleEndRelationship = async () => {
    if (!rel) return;
    try { await endRelationship(rel.id); navigate("/invite", { replace: true }); }
    catch { setShowEndRelConfirm(false); }
  };

  useEffect(() => {
    if (rel?.status === "active") getRelationshipSettings(rel.id).then(setRelSettings).catch(() => {});
  }, [rel?.id, rel?.status]);

  const flashSaved = () => { setSaved(true); setTimeout(() => setSaved(false), 1500); };
  const handleUpdate = async (section, key, value) => { await update(section, key, value); flashSaved(); };
  const handleRelUpdate = async (key, value) => {
    if (!rel) return;
    const updated = await updateRelationshipSettings(rel.id, { [key]: value });
    setRelSettings(updated); flashSaved();
  };
  const handleLogout = () => { logout(); navigate("/login", { replace: true }); };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
      <PageSpinner label="Loading settings..." />
    </div>
  );

  return (
    <PageLayout
      title="Settings"
      icon="⚙️"
      accent="dream"
      noPad
      headerRight={saved ? <motion.span className="text-xs text-[var(--status-success)] font-medium" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>Saved ✓</motion.span> : null}
    >
      <div className="flex h-[calc(100vh-64px)]">
        {/* Sidebar */}
        <div className="w-14 sm:w-52 border-r border-[var(--glass-border)] flex-shrink-0 overflow-y-auto bg-[var(--bg-secondary)]/40">
          {NAV.map(item => (
            <button key={item.id} onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-3.5 text-left transition-all relative ${activeSection === item.id ? "text-white bg-[var(--accent-dream)]/10" : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--glass-bg)]"}`}>
              {activeSection === item.id && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[var(--accent-dream)] to-[var(--accent-love)]" />}
              <span className="text-lg flex-shrink-0">{item.emoji}</span>
              <span className="text-sm font-medium hidden sm:block">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 max-w-lg">
          {activeSection === "appearance" && (
            <SettingsSection title="Appearance" description="Customize how PairSpace looks">
              <ThemeSelector appearance={settings?.appearance} onUpdate={(k, v) => handleUpdate("appearance", k, v)} />
            </SettingsSection>
          )}
          {activeSection === "privacy" && (
            <SettingsSection title="Privacy" description="Control what your partner can see">
              <PrivacyControls privacy={settings?.privacy} onUpdate={(k, v) => handleUpdate("privacy", k, v)} />
            </SettingsSection>
          )}
          {activeSection === "notifications" && (
            <SettingsSection title="Notifications" description="Manage how you receive alerts">
              <NotificationControls notifications={settings?.notifications} onUpdate={(k, v) => handleUpdate("notifications", k, v)} />
            </SettingsSection>
          )}
          {activeSection === "ai" && (
            <SettingsSection title="AI Features" description="Control AI assistance">
              <AIControls ai={settings?.ai} onUpdate={(k, v) => handleUpdate("ai", k, v)} />
            </SettingsSection>
          )}
          {activeSection === "chat" && (
            <SettingsSection title="Chat" description="Messaging preferences">
              <ToggleSwitch value={settings?.chat?.enterToSend ?? true} onChange={v => handleUpdate("chat","enterToSend",v)} label="Enter to send" description="Press Enter to send messages" />
              <ToggleSwitch value={settings?.chat?.showReadReceipts ?? true} onChange={v => handleUpdate("chat","showReadReceipts",v)} label="Read receipts" description="Show when you've read messages" />
              <ToggleSwitch value={settings?.chat?.autoDownloadMedia ?? true} onChange={v => handleUpdate("chat","autoDownloadMedia",v)} label="Auto-download media" description="Automatically load images and videos" />
            </SettingsSection>
          )}
          {activeSection === "calls" && (
            <SettingsSection title="Calls" description="Call preferences">
              <ToggleSwitch value={settings?.calls?.autoEnableMic ?? true} onChange={v => handleUpdate("calls","autoEnableMic",v)} label="Auto-enable microphone" description="Mic on when call starts" />
              <ToggleSwitch value={settings?.calls?.autoEnableCamera ?? false} onChange={v => handleUpdate("calls","autoEnableCamera",v)} label="Auto-enable camera" description="Camera on when video call starts" />
              <ToggleSwitch value={settings?.calls?.echoCancellation ?? true} onChange={v => handleUpdate("calls","echoCancellation",v)} label="Echo cancellation" description="Reduce audio echo" />
              <div className="py-3">
                <p className="text-sm text-[var(--text-secondary)] mb-2">Video quality</p>
                <div className="flex gap-2">
                  {["480p","720p","1080p"].map(q => (
                    <button key={q} onClick={() => handleUpdate("calls","preferredVideoQuality",q)}
                      className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-all ${settings?.calls?.preferredVideoQuality === q ? "border-[var(--accent-dream-soft)] bg-[var(--accent-dream)]/15 text-white" : "border-[var(--glass-border)] text-[var(--text-tertiary)] hover:border-[var(--glass-border-strong)]"}`}>
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </SettingsSection>
          )}
          {activeSection === "relationship" && rel && relSettings && (
            <SettingsSection title="Relationship Space" description="Shared settings for both of you">
              <div className="py-3 space-y-2">
                <p className="text-sm text-[var(--text-secondary)]">Space name</p>
                <input defaultValue={relSettings.customRelationshipName} onBlur={e => handleRelUpdate("customRelationshipName", e.target.value)} placeholder="Our Space" maxLength={60} className="input-field" />
              </div>
              <ToggleSwitch value={relSettings.allowGames ?? true} onChange={v => handleRelUpdate("allowGames", v)} label="Games" description="Enable games in this space" />
              <ToggleSwitch value={relSettings.allowAIInsights ?? true} onChange={v => handleRelUpdate("allowAIInsights", v)} label="AI Insights" description="Show relationship insights" />
              <ToggleSwitch value={relSettings.allowSharedActivities ?? true} onChange={v => handleRelUpdate("allowSharedActivities", v)} label="Shared activities" description="Watch together, focus sessions..." />
              <ToggleSwitch value={relSettings.anniversaryReminders ?? true} onChange={v => handleRelUpdate("anniversaryReminders", v)} label="Anniversary reminders" description="Get reminded of special dates" />
            </SettingsSection>
          )}
          {activeSection === "security" && (
            <PrivacySettings relationshipId={rel?.id} partnerName={rel?.partner?.displayName} onBlocked={() => navigate("/", { replace: true })} />
          )}
          {activeSection === "plugins" && (
            <div className="space-y-3">
              <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider px-1">Installed Plugins</p>
              <PluginManager />
            </div>
          )}
          {activeSection === "data" && (
            <SettingsSection title="Data & Account" description="Manage your data">
              <ToggleSwitch value={settings?.data?.autoSync ?? true} onChange={v => handleUpdate("data","autoSync",v)} label="Auto sync" description="Keep data synced across devices" />
              <div className="py-4 space-y-2">
                <button className="w-full glass hover:bg-white/10 rounded-xl py-3 text-sm text-[var(--text-secondary)] transition-colors font-medium">Export my data</button>
                <button onClick={handleLogout} className="w-full glass hover:bg-white/10 rounded-xl py-3 text-sm text-[var(--text-secondary)] transition-colors font-medium">Sign out</button>
                <button className="w-full bg-red-900/20 hover:bg-red-900/40 rounded-xl py-3 text-sm text-[var(--status-error)] transition-colors font-medium border border-[var(--status-error)]/20">Delete account</button>
              </div>
              {rel && (
                <div className="mt-4 pt-4 border-t border-[var(--status-error)]/20">
                  <p className="text-xs text-[var(--status-error)] font-semibold uppercase tracking-wider mb-3">Danger Zone</p>
                  <button onClick={() => setShowEndRelConfirm(true)} className="w-full bg-red-900/20 hover:bg-red-900/40 border border-[var(--status-error)]/30 rounded-xl py-3 text-sm text-[var(--status-error)] transition-all font-medium">End relationship</button>
                  <p className="text-[10px] text-[var(--text-disabled)] text-center mt-2">Your memories and messages are kept safely.</p>
                </div>
              )}
            </SettingsSection>
          )}
        </div>
      </div>

      <ConfirmModal isOpen={showEndRelConfirm} icon="💔" title="End this relationship?" description="This disconnects the space. All your memories and messages remain safely archived." confirmText="End relationship" danger onConfirm={handleEndRelationship} onCancel={() => setShowEndRelConfirm(false)} />
    </PageLayout>
  );
}
