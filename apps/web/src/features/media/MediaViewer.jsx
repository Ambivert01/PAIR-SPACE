import { useEffect } from "react";

export default function MediaViewer({ media, onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  if (!media) return null;

  return (
    <div
      className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <button className="absolute top-4 right-4 text-white text-2xl opacity-70 hover:opacity-100">×</button>

      <div onClick={(e) => e.stopPropagation()} className="max-w-3xl w-full">
        {media.type === "image" && (
          <img src={media.url} alt="" className="w-full max-h-[80vh] object-contain rounded-xl" />
        )}
        {media.type === "video" && (
          <video src={media.url} className="w-full max-h-[80vh] rounded-xl" controls autoPlay />
        )}
        {media.type === "audio" && (
          <div className="bg-[var(--glass-bg)] rounded-xl p-6 text-center space-y-4">
            <p className="text-4xl">🎵</p>
            <audio src={media.url} controls autoPlay className="w-full" />
          </div>
        )}
        {media.type === "file" && (
          <div className="bg-[var(--glass-bg)] rounded-xl p-6 text-center space-y-4">
            <p className="text-4xl">📄</p>
            <p className="text-white text-sm">{media.originalName || media.fileName}</p>
            <a
              href={media.url}
              download
              className="inline-block gradient-mixed hover:bg-[var(--accent-dream)] rounded-xl px-6 py-2.5 text-sm font-medium transition-colors"
            >
              Download
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
