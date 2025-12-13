// src/pages/scrapbook/DraggableWrapper.jsx
import React, { useEffect, useState } from 'react';
import { motion, useMotionValue } from 'framer-motion'; 
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
    x, y,
    updateItemField // Feature 2: Needed to save crop position
}) => {
    const isSelected = selectedItemId === item.id;
    const isControlActive = !!activeControl; 

    // Feature 2: Crop Mode State
    const [isCropping, setIsCropping] = useState(false);

    const xMv = useMotionValue(x || 0);
    const yMv = useMotionValue(y || 0);

    useEffect(() => {
        xMv.set(x || 0);
        yMv.set(y || 0);
    }, [x, y, xMv, yMv]);

    useEffect(() => {
        // Turn off crop if deselected
        if (!isSelected) setIsCropping(false);
    }, [isSelected]);

    // If cropping, disable main drag. If resizing, disable main drag.
    const isDraggable = drag && !isControlActive && !isCropping;

    // Feature 2: Handle Panning the Image inside the box
    const handleCropPan = (e) => {
        if(!isCropping) return;
        e.stopPropagation();
        // Calculate simpler pan logic based on movement
        const sensitivity = 0.5; // slow down the pan
        const newX = (item.objectPositionX || 50) - (e.movementX * sensitivity);
        const newY = (item.objectPositionY || 50) - (e.movementY * sensitivity);
        
        // Clamp between 0 and 100%
        const clampedX = Math.max(0, Math.min(100, newX));
        const clampedY = Math.max(0, Math.min(100, newY));

        updateItemField(pageId, item.id, 'objectPositionX', clampedX);
        updateItemField(pageId, item.id, 'objectPositionY', clampedY);
    };

    return (
        <motion.div
            className={`scrapbook-item-container ${isSelected ? "selected" : ""} ${isCropping ? "cropping" : ""}`}
            style={{
                x: xMv, 
                y: yMv,
                width: item.width || 100,
                height: item.height || 100,
                rotate: item.rotation || 0,
                position: 'absolute', 
                cursor: isDraggable ? 'grab' : (isCropping ? 'move' : 'default'),
                zIndex: isSelected ? 100 : 50
            }}
            drag={isDraggable} 
            dragConstraints={dragConstraints}
            dragMomentum={false} 
            onDragEnd={(e) => {
                const finalX = xMv.get();
                const finalY = yMv.get();
                onDragEnd(finalX, finalY);
            }}
            onTap={onTap}
            onDragStart={onDragStart}
            // Feature 2: Capture mouse move for cropping
            onMouseMove={(e) => { if(isCropping && e.buttons === 1) handleCropPan(e.nativeEvent); }}
        >
            {/* --- CONTENT --- */}
            {item.type === "text" ? (
                <div 
                    style={{ 
                        fontSize: `${item.fontSize}px`, 
                        fontFamily: item.fontFamily, 
                        fontWeight: "normal", 
                        width: "100%", height: "100%",
                        overflow: 'hidden',
                        whiteSpace: 'pre-wrap'
                    }}
                >
                    {item.content}
                </div>
            ) : item.type === "audio" ? (
                <div style={{ width: "100%", height: "100%", minHeight: '100px' }}>
                    <AudioPlayer src={item.url} />
                </div>
            ) : (
                <img 
                    src={item.url} 
                    alt={item.name} 
                    draggable="false"
                    style={{ 
                        // Feature 2: CSS Logic for Crop/Pan
                        objectPosition: `${item.objectPositionX || 50}% ${item.objectPositionY || 50}%`,
                        transform: isCropping ? 'scale(1.2)' : 'scale(1)', // Slight zoom to indicate editable area
                        transition: 'transform 0.2s'
                    }}
                />
            )}

            {/* --- CONTROLS --- */}
            {isSelected && (
                <>
                    {/* Feature 3: Delete Button (Class moved in CSS) */}
                    <button
                        className="delete-item-btn"
                        onClick={(e) => {
                            e.stopPropagation(); 
                            if (window.confirm("Delete this item?")) {
                                deleteItem(pageId, item.id);
                                setSelectedItemId(null); 
                            }
                        }}
                    >
                        &times;
                    </button>

                    {/* Feature 2: Crop Button (Only for images) */}
                    {item.type !== 'text' && item.type !== 'audio' && (
                        <button
                            className="crop-item-btn"
                            title={isCropping ? "Done Cropping" : "Crop Image"}
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsCropping(!isCropping);
                            }}
                        >
                            {isCropping ? "✓" : "✂"}
                        </button>
                    )}
                    
                    {/* Hide rotate/resize handles while cropping to reduce clutter */}
                    {!isCropping && (
                        <>
                            <div 
                                className="control-handle rotate-handle" 
                                onMouseDown={(e) => handleResizeRotateStart(e, item.id, 'rotate')}
                            />
                            {['tl', 'tr', 'bl', 'br'].map((dir) => (
                                <div 
                                    key={dir}
                                    className={`control-handle resize-handle ${dir}`}
                                    onMouseDown={(e) => handleResizeRotateStart(e, item.id, dir)}
                                />
                            ))}
                        </>
                    )}
                </>
            )}
        </motion.div>
    );
};

export default DraggableWrapper;