import { useEffect, useRef, useState } from "react";
import { useFileUpload } from "../media/useFileUpload.js";

export default function VoiceRecorder({ relationshipId, onRecorded, onClose }) {
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl]   = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [duration, setDuration]   = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError]         = useState("");

  const mediaRef    = useRef(null);
  const chunksRef   = useRef([]);
  const timerRef    = useRef(null);
  const { upload }  = useFileUpload();

  useEffect(() => () => {
    clearInterval(timerRef.current);
    mediaRef.current?.stream?.getTracks().forEach((t) => t.stop());
  }, []);

  const startRecording = async () => {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mediaRef.current = mr;
      chunksRef.current = [];

      mr.ondataavailable = (e) => chunksRef.current.push(e.data);
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
      };

      mr.start();
      setRecording(true);
      setDuration(0);
      timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
    } catch {
      setError("Microphone permission denied");
    }
  };

  const stopRecording = () => {
    mediaRef.current?.stop();
    setRecording(false);
    clearInterval(timerRef.current);
  };

  const handleUpload = async () => {
    if (!audioBlob) return;
    setUploading(true);
    try {
      const file = new File([audioBlob], `voice_${Date.now()}.webm`, { type: "audio/webm" });
      const result = await upload({ file, relationshipId, context: "voice" });
      onRecorded(result);
      onClose();
    } catch { setError("Upload failed"); }
    finally { setUploading(false); }
  };

  const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="space-y-4 text-center">
      <div className="flex flex-col items-center gap-3">
        {recording ? (
          <>
            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center animate-pulse">
              <span className="text-2xl">🎙️</span>
            </div>
            <p className="text-[var(--status-error)] font-mono text-lg">{fmt(duration)}</p>
            <button onClick={stopRecording}
              className="bg-[var(--glass-bg-strong)] hover:bg-[var(--glass-bg-strong)] rounded-xl px-6 py-2.5 text-sm transition-colors">
              Stop recording
            </button>
          </>
        ) : audioUrl ? (
          <>
            <audio src={audioUrl} controls className="w-full" />
            <p className="text-xs text-[var(--text-tertiary)]">Duration: {fmt(duration)}</p>
            <div className="flex gap-3 w-full">
              <button onClick={() => { setAudioUrl(null); setAudioBlob(null); setDuration(0); }}
                className="flex-1 bg-[var(--glass-bg-strong)] hover:bg-[var(--glass-bg-strong)] rounded-xl py-2.5 text-sm text-[var(--text-secondary)] transition-colors">
                Re-record
              </button>
              <button onClick={handleUpload} disabled={uploading}
                className="flex-1 gradient-mixed hover:bg-[var(--accent-dream)] disabled:opacity-50 rounded-xl py-2.5 text-sm font-medium transition-colors">
                {uploading ? "Uploading..." : "Use this recording"}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-[var(--glass-bg-strong)] rounded-full flex items-center justify-center">
              <span className="text-2xl">🎙️</span>
            </div>
            <button onClick={startRecording}
              className="bg-red-600 hover:bg-red-500 rounded-xl px-6 py-2.5 text-sm font-medium transition-colors">
              Start recording
            </button>
          </>
        )}
      </div>
      {error && <p className="text-[var(--status-error)] text-xs">{error}</p>}
    </div>
  );
}
