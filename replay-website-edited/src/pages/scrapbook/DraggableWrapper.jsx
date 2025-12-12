// src/pages/scrapbook/DraggableWrapper.jsx

import React from 'react';
import { motion } from 'framer-motion'; 
import AudioPlayer from "./AudioPlayer"; 

const DraggableWrapper = ({ 
    item, 
    selectedItemId, 
    deleteItem, 
    pageId, 
    setSelectedItemId,
    drag, 
    dragConstraints,
    onDragEnd,
    onTap,
    onDragStart,
    handleResizeRotateStart, 
    activeControl, 
    x, // Passed as prop
    y  // Passed as prop
}) => {
    
    const isSelected = selectedItemId === item.id;
    const isControlActive = !!activeControl; 

    const dragTransition = {
        type: "spring",
        stiffness: 100,
        damping: 10,
        mass: 0.1,
    };

    const isDraggable = drag && !isControlActive;

    return (
        <motion.div
            className={`scrapbook-item-container ${isSelected ? "selected" : ""}`}
            // Use initial/animate for framer-motion to control position
            initial={{ x: x, y: y }}
            animate={{ 
                x: x, 
                y: y, 
                width: item.width || 100,
                height: item.height || 100,
                rotate: item.rotation || 0, // Apply rotation via motion prop
                // Setting position/size/rotation here allows framer-motion to manage it
                // instead of CSS `style` properties, which is cleaner.
            }}
            transition={{ duration: 0 }} // Remove layout transition delay/spring effect on item updates
            style={{
                position: 'absolute', 
                // Removed left, top, width, height, rotate from style
                cursor: isDraggable ? 'grab' : 'default',
                userSelect: 'none',
                background: 'transparent',
                overflow: 'visible', 
            }}
            
            drag={isDraggable} 
            
            dragConstraints={dragConstraints}
            
            dragMomentum={false}

            dragElastic={0}
            
            onDragEnd={onDragEnd}
            
            dragTransition={dragTransition} 
            
            onTap={onTap}
            onDragStart={onDragStart} 
        >
            {/* Rendering the actual media content */}
            {/* ... (content rendering logic remains the same) ... */}
            
            {item.type === "text" ? (
                <div 
                    style={{ fontSize: item.fontSize, fontFamily: item.fontFamily, fontWeight: "bold", userSelect: "none", width: "100%", height: "100%" }}
                    onClick={(e) => e.stopPropagation()} 
                >
                    {item.content}
                </div>
            ) : item.type === "audio" ? (
                <div 
                    style={{ width: "100%", height: "100%", minHeight: '100px' }} 
                    onClick={(e) => e.stopPropagation()} 
                >
                    <AudioPlayer src={item.url} />
                </div>
            ) : (
                <img 
                    src={item.url} 
                    alt={item.name} 
                    draggable="false"
                    style={{ 
                        width: "100%", 
                        height: "100%", 
                        objectFit: "contain",
                        display: 'block', 
                        opacity: 1,
                    }}
                    onClick={(e) => e.stopPropagation()} 
                />
            )}

            {/* 🗑️ DELETE BUTTON & CONTROL HANDLES */}
            {isSelected && (
                <>
                    <button
                        className="delete-item-btn"
                        onClick={(e) => {
                            e.stopPropagation(); 
                            if (window.confirm("Delete this item?")) {
                                deleteItem(pageId, item.id);
                                setSelectedItemId(null); 
                            }
                        }}
                        aria-label="Delete item"
                    >
                        &times;
                    </button>
                    
                    {/* 🔄 ROTATE HANDLE */}
                    <div 
                        className="control-handle rotate-handle" 
                        onMouseDown={(e) => handleResizeRotateStart(e, item.id, 'rotate')}
                    />

                    {/* 📐 RESIZE HANDLES */}
                    {['tl', 'tr', 'bl', 'br'].map((dir) => (
                        <div 
                            key={dir}
                            className={`control-handle resize-handle ${dir}`}
                            onMouseDown={(e) => handleResizeRotateStart(e, item.id, dir)}
                        />
                    ))}
                </>
            )}
        </motion.div>
    );
};

export default DraggableWrapper;