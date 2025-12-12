import React, { useState } from "react";
import "../../styles/Upload.css";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../firebase/firebase";
import { collection, addDoc, serverTimestamp, query, orderBy, getDocs } from "firebase/firestore";

export default function UploadModal({ selectedTab, scrapbookId, setMediaFiles, close }) {
const { user } = useAuth();
const [uploadFile, setUploadFile] = useState(null);
const [uploadError, setUploadError] = useState("");
const [uploading, setUploading] = useState(false);

const handleUpload = async () => {
if (!uploadFile || !user || !scrapbookId) return;
setUploading(true);
setUploadError("");


try {
  // Convert file to Base64 (from old version)
  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (err) => reject(err);
    });

  const base64 = await fileToBase64(uploadFile);

  // Determine collection and type (old version logic)
  const collectionName = ["media", "music", "background", "clipart"].includes(selectedTab)
    ? selectedTab
    : "media";

  const type =
    selectedTab === "music"
      ? "audio"
      : selectedTab === "clipart"
      ? "clipart"
      : selectedTab === "background"
      ? "background"
      : uploadFile.type.startsWith("image")
      ? "image"
      : uploadFile.type.startsWith("video")
      ? "video"
      : "other";

  // Add document to Firestore
  await addDoc(collection(db, "users", user.uid, "scrapbook", scrapbookId, collectionName), {
    name: uploadFile.name,
    type,
    url: base64,
    createdAt: serverTimestamp(),
  });

  // Refresh media list
  const q = query(
    collection(db, "users", user.uid, "scrapbook", scrapbookId, collectionName),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  const newMedia = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data(), subcollection: collectionName }));
  setMediaFiles((prev) => [...prev.filter((m) => m.subcollection !== collectionName), ...newMedia]);

  setUploadFile(null);
  close(); // close modal
  alert("Upload successful!");
} catch (err) {
  console.error(err);
  setUploadError("Upload failed: " + err.message);
} finally {
  setUploading(false);
}


};

return ( <div className="upload-modal-overlay" onClick={close}>
<div className="upload-modal" onClick={(e) => e.stopPropagation()}> <h1>Upload {selectedTab}</h1>
{uploadError && <p className="error">{uploadError}</p>}


    <input
      type="file"
      accept={
        selectedTab === "media"
          ? "image/*,video/*,application/pdf"
          : selectedTab === "music"
          ? "audio/mp3,audio/wav,audio/*"
          : selectedTab === "background"
          ? "*/*"
          : selectedTab === "clipart"
          ? "image/*"
          : "*/*"
      }
      onChange={(e) => setUploadFile(e.target.files[0])}
    />

    <div className="upload-buttons">
      <button className="btn" onClick={handleUpload} disabled={!uploadFile || uploading}>
        {uploading ? "Uploading..." : "Upload"}
      </button>
      <button className="cancel-btn" onClick={close} disabled={uploading}>
        Cancel
      </button>
    </div>
  </div>
</div>

);
}
