// src/pages/scrapbook/SubSidebar.jsx
import React, { useState } from "react";
import UploadModal from "./UploadModal";
import "../../styles/Editing.css";

export default function SubSidebar({
    selectedTab,
    mediaFiles,
    // We don't need the state setters or page indexes here anymore for *adding*
    // as the drop logic handles it now. We still need them for UploadModal though.
    scrapbookId,
    setMediaFiles,
}) {
    const [showUploadModal, setShowUploadModal] = useState(false);

    // Function to handle the start of the drag
    const handleDragStart = (e, mediaItem) => {
        // 1. Determine the item type
        const itemType = mediaItem.type || (selectedTab === "music" ? "audio" : "image");
        
        // 2. Create the new item object with defaults and a unique ID
        const newItem = {
            ...mediaItem,
            type: itemType, 
            width: 150, // Default width
            height: 150, // Default height
            x: 0, // Placeholder X/Y, will be set on drop
            y: 0, 
            id: Date.now() + Math.random(),
        };

        // 3. Store the item data as a JSON string for transfer
        e.dataTransfer.setData("application/json", JSON.stringify(newItem));
        
        // Optional: Set a drag image (defaults to the element itself)
        // e.dataTransfer.setDragImage(e.target, 0, 0); 
    };

    return (
        <div className={`sub-sidebar ${selectedTab ? "open" : ""}`}>
            {selectedTab && selectedTab !== "text" && selectedTab !== "layout" && (
                <button className="upload-button" onClick={() => setShowUploadModal(true)}>
                    Upload {selectedTab}
                </button>
            )}

            {selectedTab && selectedTab !== "text" && (
                <div className="media-list">
                    {mediaFiles
                        .filter((m) =>
                            selectedTab === "media"
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
                                {/* draggable="false" prevents the browser from using the img as the drag object, letting the parent div control it */}
                                <img src={m.url} alt={m.name} className="media-item" draggable="false" />
                            </div>
                        ))}
                </div>
            )}

            {selectedTab === "text" && <div>Text editor options here...</div>}
            {showUploadModal && <UploadModal
                                 close={() => setShowUploadModal(false)}
                                 selectedTab={selectedTab}
                                 scrapbookId={scrapbookId}
                                 setMediaFiles={setMediaFiles}
                             />}
        </div>
    );
}