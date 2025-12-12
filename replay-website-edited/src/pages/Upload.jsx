// src/pages/Upload.jsx
import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/firebase";
import "../styles/Upload.css";

export default function Upload() {
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleUpload = async () => {
    if (!file || !user) return;
    setUploading(true);
    setError("");

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target.result;
        await addDoc(collection(db, "users", user.uid, "media"), {
          name: file.name,
          type: file.type.startsWith("image")
            ? "image"
            : file.type.startsWith("video")
            ? "video"
            : "audio",
          url: base64,
          createdAt: serverTimestamp(),
        });
        setFile(null);
        alert("Upload successful!");
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-container">
      <h1>Upload Media</h1>
      {error && <p className="error">{error}</p>}

      <input
        type="file"
        accept="image/*,video/*,audio/*"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <button
        className="btn"
        onClick={handleUpload}
        disabled={!file || uploading}
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
}
