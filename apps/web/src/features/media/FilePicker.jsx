import { useRef, useState } from "react";
import { useMediaPreview } from "./useMediaPreview.js";
import { useFileUpload } from "./useFileUpload.js";

const ACCEPT = "image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.zip";

export default function FilePicker({ relationshipId, context = "chat", onUploaded, onClose }) {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);
  const previewUrl = useMediaPreview(file);
  const { upload, uploading, progress, error, cancel, setError } = useFileUpload();

  const handleFile = (f) => { setError(""); setFile(f); };

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleSend = async () => {
    if (!file) return;
    try {
      const result = await upload({ file, relationshipId, context });
      onUploaded(result);
      onClose();
    } catch { /* error shown in UI */ }
  };

  const isImage = file?.type.startsWith("image/");
  const isVideo = file?.type.startsWith("video/");
  const isAudio = file?.type.startsWith("audio/");

  return (
    <div className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-[var(--glass-bg)] rounded-2xl w-full max-w-sm overflow-hidden">

        {/* header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--glass-border)]">
          <p className="text-sm font-medium text-white">Send file</p>
          <button onClick={onClose} className="text-[var(--text-tertiary)] hover:text-white text-xl">×</button>
        </div>

        {/* drop zone */}
        {!file ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`m-4 border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              dragging ? "border-[var(--accent-dream-soft)] bg-indigo-900/20" : "border-[var(--glass-border)] hover:border-gray-500"
            }`}
          >
            <p className="text-3xl mb-2">📎</p>
            <p className="text-sm text-[var(--text-secondary)]">Drop file here or click to browse</p>
            <p className="text-xs text-[var(--text-disabled)] mt-1">Images, videos, audio, PDF, docs</p>
            <input ref={inputRef} type="file" accept={ACCEPT} className="hidden"
              onChange={(e) => { if (e.target.files[0]) handleFile(e.target.files[0]); }} />
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {/* preview */}
            {isImage && previewUrl && (
              <img src={previewUrl} alt="preview" className="w-full max-h-48 object-cover rounded-xl" />
            )}
            {isVideo && previewUrl && (
              <video src={previewUrl} className="w-full max-h-48 rounded-xl" controls />
            )}
            {isAudio && previewUrl && (
              <audio src={previewUrl} className="w-full" controls />
            )}
            {!isImage && !isVideo && !isAudio && (
              <div className="flex items-center gap-3 bg-[var(--glass-bg-strong)] rounded-xl p-3">
                <span className="text-2xl">📄</span>
                <div className="min-w-0">
                  <p className="text-sm text-white truncate">{file.name}</p>
                  <p className="text-xs text-[var(--text-tertiary)]">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
            )}

            {/* progress */}
            {uploading && (
              <div className="space-y-1">
                <div className="h-1.5 bg-[var(--glass-bg-strong)] rounded-full overflow-hidden">
                  <div className="h-full bg-[var(--accent-dream)] transition-all" style={{ width: `${progress}%` }} />
                </div>
                <p className="text-xs text-[var(--text-tertiary)] text-right">{progress}%</p>
              </div>
            )}

            {error && <p className="text-[var(--status-error)] text-xs">{error}</p>}
          </div>
        )}

        {/* actions */}
        {file && (
          <div className="flex gap-2 px-4 pb-4">
            <button
              onClick={() => { setFile(null); cancel(); }}
              className="flex-1 bg-[var(--glass-bg-strong)] hover:bg-[var(--glass-bg-strong)] rounded-xl py-2.5 text-sm text-[var(--text-secondary)] transition-colors"
            >
              {uploading ? "Cancel" : "Remove"}
            </button>
            <button
              onClick={handleSend}
              disabled={uploading}
              className="flex-1 gradient-mixed hover:bg-[var(--accent-dream)] disabled:opacity-50 rounded-xl py-2.5 text-sm font-medium transition-colors"
            >
              {uploading ? `Uploading ${progress}%` : "Send"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
