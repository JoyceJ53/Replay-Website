// src/pages/scrapbook/SubSidebar.jsx
import React, { useState } from "react";
import UploadModal from "./UploadModal";
import "../../styles/Editing.css";

const FONT_OPTIONS = ["Arial", "Courier New", "Georgia", "Times New Roman", "Verdana", "Comic Sans MS", "Impact"];

export default function SubSidebar({
    selectedTab,
    mediaFiles,
    scrapbookId,
    setMediaFiles,
    // Feature 1 Props
    selectedItemData,
    updateItemField
}) {
    const [showUploadModal, setShowUploadModal] = useState(false);

    const handleDragStart = (e, mediaItem) => {
        // ... (Existing logic same as before)
        const itemType = mediaItem.type || (selectedTab === "music" ? "audio" : "image");
        const newItem = {
            ...mediaItem,
            type: itemType, 
            width: 150, height: 150, x: 0, y: 0, 
            id: Date.now() + Math.random(),
            // Defaults for Text
            fontSize: 24, fontFamily: "Arial", content: "New Text"
        };
        e.dataTransfer.setData("application/json", JSON.stringify(newItem));
    };

    // Helper for Text Editing
    const renderTextEditor = () => {
        if (!selectedItemData || selectedItemData.item.type !== 'text') {
            return (
                <div style={{padding: '10px', color: '#666', fontSize: '0.9rem'}}>
                    <p>Select a text item on the page to edit its properties.</p>
                    <hr />
                    <p>Or drag this to add new text:</p>
                    <div 
                        draggable="true"
                        className="media-wrapper"
                        style={{border: '1px solid #ccc', padding: '10px', background: 'white', textAlign:'center', cursor: 'grab'}}
                        onDragStart={(e) => handleDragStart(e, { type: 'text', name: 'New Text', content: "Double Click to Edit" })}
                    >
                        T
                    </div>
                </div>
            );
        }

        const { item, pageId } = selectedItemData;

        return (
            <div className="text-editor-controls" style={{ padding: "10px", display: "flex", flexDirection: "column", gap: "10px" }}>
                <h4>Edit Text</h4>
                
                <label>Content:</label>
                <textarea 
                    value={item.content}
                    onChange={(e) => updateItemField(pageId, item.id, "content", e.target.value)}
                    rows={3}
                />

                <label>Font Family:</label>
                <select 
                    value={item.fontFamily} 
                    onChange={(e) => updateItemField(pageId, item.id, "fontFamily", e.target.value)}
                >
                    {FONT_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>

                <label>Font Size: {item.fontSize}px</label>
                <input 
                    type="range" 
                    min="10" max="100" 
                    value={item.fontSize || 16} 
                    onChange={(e) => updateItemField(pageId, item.id, "fontSize", parseInt(e.target.value))}
                />
            </div>
        );
    };

    return (
        <div className={`sub-sidebar ${selectedTab ? "open" : ""}`}>
            
            {/* TEXT TAB LOGIC */}
            {selectedTab === "text" && renderTextEditor()}

            {/* OTHER TABS LOGIC */}
            {selectedTab && selectedTab !== "text" && selectedTab !== "layout" && (
                <>
                    <button className="upload-button" onClick={() => setShowUploadModal(true)}>
                        Upload {selectedTab}
                    </button>
                    <div className="media-list">
                        {mediaFiles
                            .filter((m) => selectedTab === "media" 
                                ? m.subcollection === "media" || m.id?.includes("demo")
                                : m.subcollection === selectedTab
                            )
                            .map((m) => (
                                <div 
                                    className="media-wrapper" 
                                    key={m.id} 
                                    draggable="true"
                                    onDragStart={(e) => handleDragStart(e, m)}
                                >
                                    <img src={m.url} alt={m.name} className="media-item" draggable="false" />
                                </div>
                            ))}
                    </div>
                </>
            )}

            {showUploadModal && <UploadModal
                 close={() => setShowUploadModal(false)}
                 selectedTab={selectedTab}
                 scrapbookId={scrapbookId}
                 setMediaFiles={setMediaFiles}
             />}
        </div>
    );
}