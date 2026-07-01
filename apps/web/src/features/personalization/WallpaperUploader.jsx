import { MEDIA_BASE } from "@shared/constants/urls.js";
import { useState } from "react";
import { useFileUpload } from "../media/useFileUpload.js";

export default function WallpaperUploader({ current, relationshipId, onChange }) {
  const [preview, setPreview] = useState(current ? `${MEDIA_BASE}${current}` : null);
  const { upload, uploading, progress } = useFileUpload();

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    try {
      const result = await upload({ file, relationshipId, context: "memory" });
      onChange(result.url);
    } catch { setPreview(current ? `${MEDIA_BASE}${current}` : null); }
  };

  return (
    <div className="space-y-3">
      {/* preview */}
      <div className="relative h-32 rounded-2xl overflow-hidden bg-[var(--glass-bg-strong)] border border-[var(--glass-border)]">
        {preview
          ? <img src={preview} alt="wallpaper" className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-[var(--text-disabled)] text-sm">No wallpaper set</div>
        }
        {uploading && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <p className="text-white text-sm">{progress}%</p>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <label className="flex-1 cursor-pointer">
          <div className="bg-[var(--glass-bg-strong)] hover:bg-[var(--glass-bg-strong)] rounded-xl py-2.5 text-sm text-center text-[var(--text-secondary)] transition-colors">
            {uploading ? "Uploading..." : "📷 Choose image"}
          </div>
          <input type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={uploading} />
        </label>
        {current && (
          <button onClick={() => { setPreview(null); onChange(""); }}
            className="bg-[var(--glass-bg-strong)] hover:bg-[var(--glass-bg-strong)] rounded-xl px-4 text-sm text-[var(--text-tertiary)] transition-colors">
            Remove
          </button>
        )}
      </div>
    </div>
  );
}
