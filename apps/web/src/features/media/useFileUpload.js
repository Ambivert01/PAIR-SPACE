import { useState, useRef } from "react";
import { getToken } from "../../services/auth/authService.js";

const LIMITS = { image: 10, video: 100, audio: 20, file: 50 };

const TYPE_MAP = {
  "image/jpeg": "image", "image/png": "image", "image/webp": "image", "image/gif": "image",
  "video/mp4": "video", "video/webm": "video", "video/quicktime": "video",
  "audio/mpeg": "audio", "audio/wav": "audio", "audio/ogg": "audio",
  "audio/mp4": "audio", "audio/x-m4a": "audio",
  "application/pdf": "file", "text/plain": "file", "application/zip": "file",
  "application/msword": "file",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "file",
};

export const useFileUpload = () => {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const xhrRef = useRef(null);

  const upload = ({ file, relationshipId, context = "chat" }) => {
    return new Promise((resolve, reject) => {
      setError("");
      setProgress(0);

      const type = TYPE_MAP[file.type];
      if (!type) { const e = "Unsupported file type"; setError(e); return reject(new Error(e)); }

      const limitMB = LIMITS[type];
      if (file.size > limitMB * 1024 * 1024) {
        const e = `${type} files must be under ${limitMB}MB`;
        setError(e); return reject(new Error(e));
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("context", context);
      if (relationshipId) formData.append("relationshipId", relationshipId);

      const xhr = new XMLHttpRequest();
      xhrRef.current = xhr;

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
      };

      xhr.onload = () => {
        setUploading(false);
        if (xhr.status === 201) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          const msg = JSON.parse(xhr.responseText)?.message || "Upload failed";
          setError(msg);
          reject(new Error(msg));
        }
      };

      xhr.onerror = () => { setUploading(false); setError("Network error"); reject(new Error("Network error")); };
      xhr.onabort = () => { setUploading(false); setProgress(0); reject(new Error("Cancelled")); };

      xhr.open("POST", "/api/media/upload");
      xhr.setRequestHeader("Authorization", `Bearer ${getToken()}`);
      setUploading(true);
      xhr.send(formData);
    });
  };

  const cancel = () => xhrRef.current?.abort();

  return { upload, uploading, progress, error, cancel, setError };
};
