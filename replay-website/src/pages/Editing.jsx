// Imports
import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { collection, getDocs, query, orderBy, addDoc, serverTimestamp, doc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import "../styles/Editing.css";

// EDITING PAGE
export default function Editing() {
  // HOOKS
  const { user } = useAuth();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const scrapbookId = params.get("scrapbookId");
  const canvasRef = useRef(null);

  const [mediaFiles, setMediaFiles] = useState([]);
  const [selectedTab, setSelectedTab] = useState(null);
  const [pages, setPages] = useState([{ id: 1, items: [] }, { id: 2, items: [] }]);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [draggingItemId, setDraggingItemId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // USER & USER MEDIA
  useEffect(() => {
    if (!user || !scrapbookId) return;

    const builtInMedia = [
      {
        id: "lion-demo",
        name: "Lion",
        url: "https://classroomclipart.com/image/static2/preview2/cute-animal-lion-clipart-33697.jpg",
        type: "image",
      },
      {
        id: "map-demo",
        name: "World Map",
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/World_map_-_low_resolution.svg/1024px-World_map_-_low_resolution.svg.png",
        type: "image",
      },
    ];

    const fetchAllMedia = async () => {
      const subcollections = ["media", "music", "background", "clipart"];
      let allMedia = [];

      for (const sub of subcollections) {
        const q = query(
          collection(db, "users", user.uid, "scrapbook", scrapbookId, sub),
          orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(q);
        const media = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          subcollection: sub,
        }));
        allMedia = allMedia.concat(media);
      }

      setMediaFiles([...allMedia, ...builtInMedia]);

    };

    fetchAllMedia();
  }, [user, scrapbookId]);

  // ADD TO PAGE FUNCTION
  const addToPage = (media, x = 100, y = 100) => {
    setPages((prev) => {
      const targetPage = prev[0].items.length <= prev[1].items.length ? 0 : 1;
      const newPages = [...prev];
      newPages[targetPage].items.push({
        ...media,
        type: media.type || "image",
        x,
        y,
        width: 100,
        height: 100,
        id: Date.now() + Math.random(),
      });
      return newPages;
    });
  };

  // ADD TEXT FUNCTION
  const addTextToPage = ({ content, fontSize = 20, fontFamily = "Arial" }) => {
    const newTextItem = { id: Date.now() + Math.random(), type: "text", content, x: 100, y: 100, fontSize, fontFamily };
    setPages((prev) => {
      const updated = [...prev];
      updated[0].items.push(newTextItem);
      return updated;
    });
  };

  // DELETE MEDIA UPLOADS FUNCTION
  const handleDeleteMedia = async (media) => {
    if (!user || !scrapbookId) return;

    const confirmDelete = window.confirm(`Are you sure you want to delete "${media.name}"?`);
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "users", user.uid, "scrapbook", scrapbookId, media.subcollection, media.id));
      setMediaFiles((prev) => prev.filter((m) => m.id !== media.id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete media: " + err.message);
    }
  };

  // DRAGGING HANDLERS
  const handleMouseDownItem = (id, e) => {
    e.stopPropagation();
    setSelectedItemId(id);
    setDraggingItemId(id);

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    let item, pageIndex;
    for (let i = 0; i < pages.length; i++) {
      item = pages[i].items.find((itm) => itm.id === id);
      if (item) {
        pageIndex = i;
        break;
      }
    }
    if (!item) return;

    const pageWidth = 800;
    const pageGap = 32;
    const pageLeft = rect.left + pageIndex * (pageWidth + pageGap);

    const offsetX = e.clientX - pageLeft - item.x;
    const offsetY = e.clientY - rect.top - item.y;

    setDragOffset({ x: offsetX, y: offsetY });
  };

  const handleMouseUp = () => setDraggingItemId(null);

  const handleMouseMove = (e) => {
    if (!draggingItemId) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    const xGlobal = e.clientX - rect.left - dragOffset.x;
    const yGlobal = e.clientY - rect.top - dragOffset.y;

    setPages((prev) => {
      const pageWidth = 800;
      const pageGap = 32;
      let targetPageIndex = xGlobal < pageWidth ? 0 : 1;

      const newPages = prev.map((page) => ({
        ...page,
        items: page.items.filter((i) => i.id !== draggingItemId),
      }));

      let draggedItem;
      for (let page of prev) {
        draggedItem = page.items.find((i) => i.id === draggingItemId);
        if (draggedItem) break;
      }
      if (!draggedItem) return newPages;

      draggedItem = { ...draggedItem, x: xGlobal, y: yGlobal };
      newPages[targetPageIndex].items.push(draggedItem);

      return newPages;
    });
  };

  const handleDeleteItem = (id) => {
    setPages((prev) =>
      prev.map((page) => ({
        ...page,
        items: page.items.filter((item) => item.id !== id),
      }))
    );
    if (selectedItemId === id) setSelectedItemId(null);
  };

  const handleCanvasClick = () => setSelectedItemId(null);

  // DRAG & DROP HANDLERS
  const handleDragStart = (e, media) => e.dataTransfer.setData("media", JSON.stringify(media));

  const handleDrop = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const mediaData = e.dataTransfer.getData("media");
    if (!mediaData) return;
    const media = JSON.parse(mediaData);
    addToPage(media, x, y);
  };

  // RETURN JSX
  if (!scrapbookId) return <div>Please select a scrapbook first.</div>;

  return (
    <div className="editing-wrapper">
      <header className="editing-header"></header>
            <div className="editing-container">
              {/* Main Sidebar */}
              <div className="sidebar">
                <div className="tabs">
                  {[
                    { name: "media", emoji: "🎥" },
                    { name: "layout", emoji: "📐" },
                    { name: "background", emoji: "🌄" },
                    { name: "border", emoji: "⬜" },
                    { name: "clipart", emoji: "🖼️" },
                    { name: "music", emoji: "🎵" },
                    { name: "text", emoji: "🔤" },
                  ].map(({ name, emoji }) => (
                    <div
                      key={name}
                      className={`tab ${selectedTab === name ? "active" : ""}`}
                      onClick={() => setSelectedTab(selectedTab === name ? null : name)}
                    >
                      <div className="tab-emoji">{emoji}</div>
                      <div className="tab-label">{name.charAt(0).toUpperCase() + name.slice(1)}</div>
                    </div>
                  ))}
                </div>
              </div>
      
              {/* Sub-sidebar */}
              <div className={`sub-sidebar ${selectedTab ? "open" : ""}`}>
                {selectedTab && selectedTab !== "text" && selectedTab !== "layout" && selectedTab !== "border" && (
                  <button className="upload-button" onClick={() => setShowUploadModal(true)}>
                    Upload {selectedTab}
                  </button>
                )}
      
                {selectedTab && selectedTab !== "text" && (
                  <div className="media-list">
                    {mediaFiles
                      .filter((m) =>
                        selectedTab === "media" ? m.subcollection === "media" || m.id.startsWith("lion-demo") || m.id.startsWith("map-demo")
                        : m.subcollection === selectedTab
                      )
                      .map((m) => (
                        <div className="media-wrapper" key={m.id} style={{ position: "relative" }}>
                        <img src={m.url} alt={m.name} className="media-item" onClick={() => addToPage(m)} />
                        <div className="overlay-text">Click to add</div>
                        {/* Only show delete button if the media was uploaded by the user */}
                        {m.subcollection && (
                          <button
                            className="delete-media-button"
                            onClick={() => handleDeleteMedia(m)}
                            style={{
                              position: "absolute",
                              top: 2,
                              right: 2,
                              background: "red",
                              color: "white",
                              border: "none",
                              borderRadius: "50%",
                              width: 20,
                              height: 20,
                              cursor: "pointer",
                            }}
                          >
                            ×
                          </button>
                        )}
                      </div>
                      ))}
                  </div>
                )}
      
                {selectedTab === "text" && (
                  <div className="text-tab">
                    <input type="text" placeholder="Enter text" id="newTextInput" className="text-input" />
                    <select id="fontSizeSelect" className="text-select">
                      {[12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48].map((size) => (
                        <option key={size} value={size}>{size}px</option>
                      ))}
                    </select>
                    <select id="fontFamilySelect" className="text-select">
                      {["Arial", "Verdana", "Times New Roman", "Georgia", "Courier New", "Impact", "Comic Sans MS", "Tahoma"].map((font) => (
                        <option key={font} value={font}>{font}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => {
                        const input = document.getElementById("newTextInput");
                        if (input.value.trim() === "") return;
                        const fontSize = parseInt(document.getElementById("fontSizeSelect").value);
                        const fontFamily = document.getElementById("fontFamilySelect").value;
                        addTextToPage({ content: input.value, fontSize, fontFamily });
                        input.value = "";
                      }}
                      className="add-text-button"
                    >
                      Add Text
                    </button>
                  </div>
                )}
              </div>
      
              {/* Canvas */}
              <div
                className="scrapbook-canvas"
                ref={canvasRef}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseDown={handleCanvasClick}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
              >
                <div className="scrapbook-background">
                  {pages.map((page) => (
                    <div key={page.id} className="page">
                      {page.items.map((item) => (
                        <div
                          key={item.id}
                          style={{
                            position: "absolute",
                            left: item.x,
                            top: item.y,
                            border: selectedItemId === item.id ? "2px dashed blue" : "none",
                            cursor: draggingItemId === item.id ? "grabbing" : "grab",
                            transform: "translate(-50%, -50%)",
                          }}
                          onMouseDown={(e) => handleMouseDownItem(item.id, e)}
                        >
                          {selectedItemId === item.id && (
                            <button
                              style={{
                                position: "absolute",
                                top: -10,
                                right: -10,
                                zIndex: 10,
                                background: "red",
                                color: "white",
                                border: "none",
                                borderRadius: "50%",
                                width: 20,
                                height: 20,
                                cursor: "pointer",
                              }}
                              onClick={() => handleDeleteItem(item.id)}
                            >
                              ×
                            </button>
                          )}
                          {item.type === "text" ? (
                            <div
                              style={{
                                fontSize: item.fontSize,
                                fontFamily: item.fontFamily || "Arial",
                                fontWeight: "bold",
                                userSelect: "none",
                              }}
                            >
                              {item.content}
                            </div>
                          ) : (
                            <img
                              src={item.url}
                              alt={item.type}
                              style={{ width: item.width || 100, height: item.height || 100, userSelect: "none" }}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
      
            {/* Upload Modal */}
            {showUploadModal && (
              <div className="upload-modal-overlay" onClick={() => setShowUploadModal(false)}>
                <div className="upload-modal" onClick={(e) => e.stopPropagation()}>
                  <h1>Upload {selectedTab}</h1>
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
                  <button
                    className="btn"
                    onClick={async () => {
                      if (!uploadFile || !user || !scrapbookId) return;
                      setUploading(true);
                      setUploadError("");

                      try {
                        // Convert file to base64
                        const fileToBase64 = (file) => {
                          return new Promise((resolve, reject) => {
                            const reader = new FileReader();
                            reader.readAsDataURL(file);
                            reader.onload = () => resolve(reader.result);
                            reader.onerror = (error) => reject(error);
                          });
                        };

                        const base64 = await fileToBase64(uploadFile);

                        // Determine Firestore subcollection
                        const collectionName =
                          selectedTab === "media" || selectedTab === "music" || selectedTab === "background" || selectedTab === "clipart"
                            ? selectedTab
                            : "media";

                        // Determine type
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

                        // Upload to Firestore (now under scrapbook)
                        const docRef = await addDoc(collection(db, "users", user.uid, "scrapbook", scrapbookId, collectionName), {
                          name: uploadFile.name,
                          type: type,
                          url: base64,
                          createdAt: serverTimestamp(),
                        });

                        // Refresh media list in sidebar
                        const q = query(collection(db, "users", user.uid, "scrapbook", scrapbookId, collectionName), orderBy("createdAt", "desc"));
                        const snapshot = await getDocs(q);
                        const newMedia = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data(), subcollection: collectionName }));
                        setMediaFiles((prev) => [...prev.filter((m) => m.subcollection !== collectionName), ...newMedia]);

                        setUploadFile(null);
                        setShowUploadModal(false); // close modal on success
                        alert("Upload successful!");
                      } catch (err) {
                        console.error(err);
                        setUploadError("Upload failed: " + err.message);
                      } finally {
                        setUploading(false);
                      }
                    }}
                    disabled={!uploadFile || uploading}
                  >
                    {uploading ? "Uploading..." : "Upload"}
                  </button> 
                </div>
              </div>
            )}
    </div>
  );
}
