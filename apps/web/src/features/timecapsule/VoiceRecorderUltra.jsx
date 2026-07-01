/**
 * VoiceRecorderUltra Component
 *
 * Premium voice recorder with glassmorphism and smooth animations
 */

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useFileUpload } from "../media/useFileUpload.js";
import { scaleIn } from "../../utils/motionPresets.js";

export default function VoiceRecorderUltra({
  relationshipId,
  onRecorded,
  onClose,
}) {
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [duration, setDuration] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const mediaRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const { upload } = useFileUpload();

  useEffect(
    () => () => {
      clearInterval(timerRef.current);
      mediaRef.current?.stream?.getTracks().forEach((t) => t.stop());
    },
    [],
  );

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
      const file = new File([audioBlob], `voice_${Date.now()}.webm`, {
        type: "audio/webm",
      });
      const result = await upload({ file, relationshipId, context: "voice" });
      onRecorded(result);
      onClose();
    } catch {
      setError("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="stack-md text-center">
      <div className="flex flex-col items-center gap-3">
        <AnimatePresence mode="wait">
          {recording ? (
            <motion.div
              key="recording"
              className="flex flex-col items-center gap-3"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              {/* Recording indicator */}
              <motion.div
                className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-glow-love"
                animate={{
                  scale: [1, 1.1, 1],
                  boxShadow: [
                    "0 0 20px rgba(239, 68, 68, 0.5)",
                    "0 0 40px rgba(239, 68, 68, 0.8)",
                    "0 0 20px rgba(239, 68, 68, 0.5)",
                  ],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <span className="text-2xl">🎙️</span>
              </motion.div>

              {/* Duration */}
              <motion.p
                className="text-[var(--status-error)] font-mono text-lg font-bold"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {fmt(duration)}
              </motion.p>

              {/* Stop button */}
              <motion.button
                onClick={stopRecording}
                className="glass-strong hover:glass rounded-xl px-6 py-2.5 text-sm transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Stop recording
              </motion.button>
            </motion.div>
          ) : audioUrl ? (
            <motion.div
              key="preview"
              className="w-full stack-sm"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              {/* Audio player */}
              <motion.div className="glass rounded-xl p-3" {...scaleIn}>
                <audio src={audioUrl} controls className="w-full" />
              </motion.div>

              {/* Duration info */}
              <p className="text-xs text-[var(--text-tertiary)]">
                Duration: {fmt(duration)}
              </p>

              {/* Action buttons */}
              <div className="flex gap-3 w-full">
                <motion.button
                  onClick={() => {
                    setAudioUrl(null);
                    setAudioBlob(null);
                    setDuration(0);
                  }}
                  className="flex-1 glass-strong hover:glass rounded-xl py-2.5 text-sm text-[var(--text-secondary)] transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Re-record
                </motion.button>
                <motion.button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="flex-1 btn-primary btn-base disabled"
                  whileHover={{ scale: uploading ? 1 : 1.02 }}
                  whileTap={{ scale: uploading ? 1 : 0.98 }}
                >
                  {uploading ? (
                    <span className="hstack-sm justify-center">
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      >
                        ⟳
                      </motion.span>
                      Uploading...
                    </span>
                  ) : (
                    "Use this recording"
                  )}
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              className="flex flex-col items-center gap-3"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              {/* Microphone icon */}
              <motion.div
                className="w-16 h-16 glass rounded-full flex items-center justify-center"
                whileHover={{ scale: 1.1 }}
              >
                <span className="text-2xl">🎙️</span>
              </motion.div>

              {/* Start button */}
              <motion.button
                onClick={startRecording}
                className="bg-red-600 hover:bg-red-500 rounded-xl px-6 py-2.5 text-sm font-medium shadow-soft transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Start recording
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.p
            className="text-[var(--status-error)] text-xs"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
