// src/pages/scrapbook/Page.jsx

import React, { useState, useRef, useEffect, useCallback } from "react"; 
import DraggableWrapper from "./DraggableWrapper"; 
import "../../styles/scrapbook/Scrapbook.css";

export default function Page({
    page,
    isCurrent,
    index,
    currentPageIndex,
    onFlipForward,
    onFlipBackward,
    addNewPage,
    totalPages,
    handleStopDrag,
    deleteItem, 
    handleDropMedia,
    updateItemSizeRotation, 
}) {
    if (!isCurrent || !page) return null;

    const constraintsRef = useRef(null); 
    const [hoverCorner, setHoverCorner] = useState(null); 
    const [selectedItemId, setSelectedItemId] = useState(null); 
    
    // Tracks the item currently being resized/rotated
    const [activeControl, setActiveControl] = useState(null); 

    const isLeft = index === currentPageIndex;
    const isRight = index === currentPageIndex + 1;

    // ... (rest of existing logic remains the same) ...

    const handleCornerClick = (corner) => {
        if ((corner === "tr" || corner === "br") && isRight) {
            if (currentPageIndex + 2 >= totalPages) {
                addNewPage && addNewPage();
            }
            onFlipForward && onFlipForward();
        } else if ((corner === "tl" || corner === "bl") && isLeft) {
            onFlipBackward && onFlipBackward();
        }
    };
    
    const handlePageClick = (e) => {
        if (e.target.className.includes('page') || !e.target.closest('.scrapbook-item-container')) {
            setSelectedItemId(null);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const rect = constraintsRef.current.getBoundingClientRect();
        const dropX = e.clientX - rect.left;
        const dropY = e.clientY - rect.top;
        const data = e.dataTransfer.getData("application/json");
        if (data) {
            try {
                const item = JSON.parse(data);
                handleDropMedia(page.id, item, dropX, dropY);
            } catch (error) {
                console.error("Failed to parse dropped item data:", error);
            }
        }
    };

    // --- RESIZE/ROTATE HANDLERS ---

    // 1. Start handler: Sets up the initial state for manipulation
    const handleResizeRotateStart = (e, itemId, type) => {
        e.preventDefault();
        e.stopPropagation(); 
        // Find the item when starting, and store its initial dimensions/position in the state
        const item = page.items.find(i => i.id === itemId);
        if (!item) return;

        setActiveControl({ 
            itemId, 
            type, 
            startX: e.clientX, 
            startY: e.clientY,
            initialWidth: item.width || 100,
            initialHeight: item.height || 100,
            initialRotation: item.rotation || 0,
            initialX: item.x || 0,
            initialY: item.y || 0,
        });
    };

    // 3. End handler: Cleans up the state (Memoized for stable cleanup)
    const handleControlEnd = useCallback(() => {
        if (!activeControl) return;
        setActiveControl(null);
    }, [activeControl]); // Depend only on activeControl

    // 2. Move handler: Calculates new dimensions/rotation based on mouse position
    // (Memoized. IMPORTANT: Since `activeControl` is in the dependencies, 
    // this function is stable as long as `activeControl` is null or stable.)
    const handleControlMove = useCallback((e) => {
        // Use the initial values stored in activeControl for calculation, 
        // not the constantly changing `item` from `page.items.find`
        if (!activeControl || !constraintsRef.current) return;
        e.preventDefault();

        const { itemId, type, startX, startY, initialWidth, initialHeight, initialRotation, initialX, initialY } = activeControl;
        
        const pageRect = constraintsRef.current.getBoundingClientRect();
        
        const itemCenterGlobalX = pageRect.left + initialX + initialWidth / 2;
        const itemCenterGlobalY = pageRect.top + initialY + initialHeight / 2;
        
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;

        let newWidth = initialWidth;
        let newHeight = initialHeight;
        let newRotation = initialRotation;
        let newX = initialX;
        let newY = initialY;
        
        const MIN_SIZE = 20;

        // --- ROTATION LOGIC ---
        if (type === 'rotate') {
            const angleStart = Math.atan2(startY - itemCenterGlobalY, startX - itemCenterGlobalX);
            const angleCurrent = Math.atan2(e.clientY - itemCenterGlobalY, e.clientX - itemCenterGlobalX);
            const angleDelta = (angleCurrent - angleStart) * (180 / Math.PI);
            newRotation = initialRotation + angleDelta;
        } 
        // --- RESIZING LOGIC ---
        else {
            if (type.includes('r')) newWidth = Math.max(MIN_SIZE, initialWidth + deltaX);
            if (type.includes('b')) newHeight = Math.max(MIN_SIZE, initialHeight + deltaY);
            
            if (type.includes('l')) {
                newWidth = Math.max(MIN_SIZE, initialWidth - deltaX);
                newX = initialX + initialWidth - newWidth;
            }
            if (type.includes('t')) {
                newHeight = Math.max(MIN_SIZE, initialHeight - deltaY);
                newY = initialY + initialHeight - newHeight;
            }
        }

        // Call the update function with the calculated values
        updateItemSizeRotation(page.id, itemId, newWidth, newHeight, newRotation, newX, newY);
    }, [activeControl, page.id, updateItemSizeRotation]); 

    // 4. useEffect to attach/clean up global listeners
    useEffect(() => {
        if (activeControl) {
            // NOTE: We attach the *current* version of the memoized handlers
            window.addEventListener('mousemove', handleControlMove);
            window.addEventListener('mouseup', handleControlEnd);
        }
        return () => {
            // NOTE: The cleanup function ensures the *same* handlers are removed
            window.removeEventListener('mousemove', handleControlMove);
            window.removeEventListener('mouseup', handleControlEnd);
        };
    }, [activeControl, handleControlMove, handleControlEnd]); // Use memoized handlers as dependencies
    
    // --- RENDER ---
    return (
        <div 
            ref={constraintsRef} 
            className={`page ${isLeft ? "left-page" : ""} ${isRight ? "right-page" : ""}`}
            onClick={handlePageClick}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
        >
            {/* page content */}
            {page.items?.map((item) => (
                <DraggableWrapper 
                    key={item.id}
                    item={item} 
                    selectedItemId={selectedItemId} 
                    deleteItem={deleteItem} 
                    pageId={page.id}
                    setSelectedItemId={setSelectedItemId}
                    
                    drag={true} 
                    x={item.x || 0} 
                    y={item.y || 0} 
                    
                    dragConstraints={constraintsRef}
                    
                    onDragStart={(e) => {
                        e.stopPropagation();
                        setSelectedItemId(item.id);
                    }}

                    onDragEnd={(e, info) => {
                        // The info.point coordinates are relative to the viewport.
                        // We use the item's current x/y as the *start* reference, and 
                        // the delta to calculate the *new* position relative to the page container.
                        
                        // NOTE: If using the `info.offset` (difference from start drag position) 
                        // and adding it to the item's initial x/y is simpler, you can do that.
                        // Since `framer-motion` handles the drag position internally and only gives
                        // `info.point` (viewport absolute), let's stick to using `info.point` 
                        // relative to the container, as was in the original code, but ensure 
                        // we use the item's internal x/y for the final position calculation 
                        // after the drag animation finishes.
                        
                        // A safer way, given the nature of framer-motion's drag:
                        // Use the provided `info.offset` (relative to drag start) 
                        // and add it to the component's *initial* x/y position.
                        const newX = (item.x || 0) + info.offset.x;
                        const newY = (item.y || 0) + info.offset.y;

                        handleStopDrag(page.id, item.id, newX, newY);
                    }}
                    
                    onTap={(e) => {
                        e.stopPropagation(); 
                        setSelectedItemId(item.id);
                    }} 

                    handleResizeRotateStart={handleResizeRotateStart}
                    activeControl={activeControl}
                />
            ))}

            {/* corner fold elements */}
            {["tl","tr","bl","br"].map((corner) => (
                <div
                    key={corner}
                    className={`corner ${corner} ${hoverCorner === corner ? "folded" : ""}`}
                    onMouseEnter={() => setHoverCorner(corner)}
                    onMouseLeave={() => setHoverCorner(null)}
                    onClick={() => handleCornerClick(corner)}
                />
            ))}
        </div>
    );
}