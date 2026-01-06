// src/pages/scrapbook/DraggableWrapper.jsx
import React, { useEffect, useState, useRef } from 'react';
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
    updateItemField 
}) => {
    const isSelected = selectedItemId === item.id;
    const isControlActive = !!activeControl; 

    const [isCropping, setIsCropping] = useState(false);
    const xMv = useMotionValue(x || 0);
    const yMv = useMotionValue(y || 0);

    // --- SYNC MOTION VALUES ---
    useEffect(() => {
        xMv.set(x || 0);
        yMv.set(y || 0);
    }, [x, y, xMv, yMv]);

    useEffect(() => {
        // Ensure crop mode is disabled when the item is deselected
        if (!isSelected) setIsCropping(false);
    }, [isSelected]);

    // --- CROP INITIALIZATION & STATE ---
    const imgW = item.imgW !== undefined ? item.imgW : "100%";
    const imgH = item.imgH !== undefined ? item.imgH : "100%";
    const imgX = item.imgX || 0;
    const imgY = item.imgY || 0;

    const toggleCrop = (e) => {
        e.stopPropagation();
        if (!isCropping) {
            // ENTERING CROP MODE
            if (item.imgW === undefined) {
                // Initialize internal image size to match container size
                updateItemField(pageId, item.id, 'imgW', item.width || 100);
                updateItemField(pageId, item.id, 'imgH', item.height || 100);
                updateItemField(pageId, item.id, 'imgX', 0);
                updateItemField(pageId, item.id, 'imgY', 0);
            }
        }
        setIsCropping(!isCropping);
    };

    // --- CROP HANDLER (The "Cutting" Logic) ---
    const handleCropStart = (e, direction) => {
        e.preventDefault();
        e.stopPropagation();

        const startX = e.clientX;
        const startY = e.clientY;
        
        // Snapshot current state
        const startW = item.width || 100;
        const startH = item.height || 100;
        const startXPos = item.x || 0;
        const startYPos = item.y || 0;
        
        const startImgX = item.imgX || 0;
        const startImgY = item.imgY || 0;

        const onPointerMove = (ev) => {
            const deltaX = ev.clientX - startX;
            const deltaY = ev.clientY - startY;
            const MIN_SIZE = 20;

            let newW = startW, newH = startH, newX = startXPos, newY = startYPos;
            let newImgX = startImgX, newImgY = startImgY;

            if (direction === 'e') { 
                newW = Math.max(MIN_SIZE, startW + deltaX);
            }
            else if (direction === 'w') { 
                const proposedW = startW - deltaX;
                if (proposedW >= MIN_SIZE) {
                    newW = proposedW;
                    newX = startXPos + deltaX;
                    newImgX = startImgX - deltaX;
                }
            }
            else if (direction === 's') { 
                newH = Math.max(MIN_SIZE, startH + deltaY);
            }
            else if (direction === 'n') { 
                const proposedH = startH - deltaY;
                if (proposedH >= MIN_SIZE) {
                    newH = proposedH;
                    newY = startYPos + deltaY;
                    newImgY = startImgY - deltaY;
                }
            }

            // Direct update for performance
            updateItemField(pageId, item.id, 'width', newW);
            updateItemField(pageId, item.id, 'height', newH);
            updateItemField(pageId, item.id, 'x', newX);
            updateItemField(pageId, item.id, 'y', newY);
            updateItemField(pageId, item.id, 'imgX', newImgX);
            updateItemField(pageId, item.id, 'imgY', newImgY);
        };

        const onPointerUp = () => {
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerup', onPointerUp);
        };

        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);
    };

    // --- PAN HANDLER (Moving the image inside the frame) ---
    const handlePanStart = (e) => {
        if (!isCropping) return;
        e.preventDefault();
        e.stopPropagation();
        
        const startX = e.clientX;
        const startY = e.clientY;
        const startImgX = item.imgX || 0;
        const startImgY = item.imgY || 0;

        const onPointerMove = (ev) => {
            const deltaX = ev.clientX - startX;
            const deltaY = ev.clientY - startY;
            updateItemField(pageId, item.id, 'imgX', startImgX + deltaX);
            updateItemField(pageId, item.id, 'imgY', startImgY + deltaY);
        };

        const onPointerUp = () => {
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerup', onPointerUp);
        };

        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);
    };

    // Item container is draggable only when not resizing/rotating or cropping
    const isDraggable = drag && !isControlActive && !isCropping;

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
                cursor: isDraggable ? 'grab' : (isCropping ? 'move' : 'default'), // Use 'move' cursor when panning image
                zIndex: isSelected ? 100 : 50,
                overflow: 'hidden', 
                touchAction: 'none'
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
            // If cropping, clicking the image pans it instead of dragging the container
            onPointerDown={isCropping ? handlePanStart : undefined}
        >
            {/* --- ITEM CONTENT --- */}
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
                        position: item.imgW ? 'absolute' : 'static', // Switch to absolute pos for cropping
                        width: imgW,
                        height: imgH,
                        left: imgX,
                        top: imgY,
                        objectFit: item.imgW ? 'fill' : 'cover',
                        pointerEvents: 'none', 
                        userSelect: 'none'
                    }}
                />
            )}

            {/* --- CONTROLS --- */}
            {isSelected && (
                <>
                     {/* DELETE BUTTON (Top Right) */}
                    <button
                        className="delete-item-btn"
                        onPointerDown={(e) => e.stopPropagation()} 
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

                    {/* CROP BUTTON (Top Left, typically) */}
                    {item.type !== 'text' && item.type !== 'audio' && (
                        <button
                            className="crop-item-btn"
                            title={isCropping ? "Done Cropping" : "Crop Image"}
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={toggleCrop}
                        >
                            {isCropping ? "✓" : "✂"}
                        </button>
                    )}
                    
                    {/* --- STANDARD CONTROLS (Hidden when cropping) --- */}
                    {!isCropping && (
                        <>
                            {/* ROTATE HANDLE */}
                            <div 
                                className="control-handle rotate-handle" 
                                onMouseDown={(e) => { e.stopPropagation(); handleResizeRotateStart(e, item.id, 'rotate'); }}
                            />
                            {/* RESIZE HANDLES (Corners) */}
                            {['tl', 'tr', 'bl', 'br'].map((dir) => (
                                <div 
                                    key={dir}
                                    className={`control-handle resize-handle ${dir}`}
                                    onMouseDown={(e) => { e.stopPropagation(); handleResizeRotateStart(e, item.id, dir); }}
                                />
                            ))}
                        </>
                    )}

                    {/* --- CROP SIDE HANDLES (Visible only when cropping) --- */}
                    {isCropping && item.type !== 'text' && item.type !== 'audio' && (
                        <>
                            <div className="crop-handle n" onPointerDown={(e) => handleCropStart(e, 'n')} />
                            <div className="crop-handle s" onPointerDown={(e) => handleCropStart(e, 's')} />
                            <div className="crop-handle w" onPointerDown={(e) => handleCropStart(e, 'w')} />
                            <div className="crop-handle e" onPointerDown={(e) => handleCropStart(e, 'e')} />
                            {/* Visual guide */}
                            <div style={{position:'absolute', inset:0, border:'1px dashed #ff9800', pointerEvents:'none'}}/>
                        </>
                    )}
                </>
            )}
        </motion.div>
    );
};

export default DraggableWrapper;