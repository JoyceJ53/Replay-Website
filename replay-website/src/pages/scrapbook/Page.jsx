// src/pages/scrapbook/Page.jsx
import React, { useState, useRef, useCallback } from "react"; 
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
    // New Props
    selectedItemId,
    setSelectedItemId,
    updateItemField
}) {
    // Only render if it's the current left or current right page
    const isLeft = index === currentPageIndex;
    const isRight = index === currentPageIndex + 1;
    
    // Simple optimization: don't render hidden pages to save DOM weight
    if (!isLeft && !isRight) return null;

    const constraintsRef = useRef(null); 
    const [hoverCorner, setHoverCorner] = useState(null); 
    const [activeControl, setActiveControl] = useState(null); 
    
    // Feature 4: Animation State
    const [isTurning, setIsTurning] = useState(false);

    const handleCornerClick = (corner) => {
        // Feature 4: Trigger Animation + Action
        if ((corner === "tr" || corner === "br") && isRight) {
            setIsTurning("forward");
            setTimeout(() => {
                if (currentPageIndex + 2 >= totalPages) addNewPage && addNewPage();
                onFlipForward && onFlipForward();
                setIsTurning(false);
            }, 600); // Sync with CSS animation time
        } else if ((corner === "tl" || corner === "bl") && isLeft) {
            setIsTurning("backward");
            setTimeout(() => {
                onFlipBackward && onFlipBackward();
                setIsTurning(false);
            }, 600);
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
                // Center item on mouse drop
                const centeredX = dropX - (item.width || 100) / 2;
                const centeredY = dropY - (item.height || 100) / 2;
                handleDropMedia(page.id, item, centeredX, centeredY);
            } catch (error) { console.error(error); }
        }
    };

    // --- RESIZE/ROTATE LOGIC (Unchanged) ---
    const handleResizeRotateStart = (e, itemId, type) => {
        e.preventDefault(); e.stopPropagation(); 
        const item = page.items.find(i => i.id === itemId);
        if (!item) return;
        setActiveControl({ 
            itemId, type, 
            startX: e.clientX, startY: e.clientY,
            initialWidth: item.width || 100, initialHeight: item.height || 100,
            initialRotation: item.rotation || 0, initialX: item.x || 0, initialY: item.y || 0,
        });
    };

    const handleControlEnd = useCallback(() => {
        if (!activeControl) return;
        setActiveControl(null);
    }, [activeControl]);

    const handleControlMove = useCallback((e) => {
        if (!activeControl || !constraintsRef.current) return;
        e.preventDefault();
        const { itemId, type, startX, startY, initialWidth, initialHeight, initialRotation, initialX, initialY } = activeControl;
        const pageRect = constraintsRef.current.getBoundingClientRect();
        const itemCenterGlobalX = pageRect.left + initialX + initialWidth / 2;
        const itemCenterGlobalY = pageRect.top + initialY + initialHeight / 2;
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        let newWidth = initialWidth, newHeight = initialHeight, newRotation = initialRotation, newX = initialX, newY = initialY;
        const MIN_SIZE = 20;

        if (type === 'rotate') {
            const angleStart = Math.atan2(startY - itemCenterGlobalY, startX - itemCenterGlobalX);
            const angleCurrent = Math.atan2(e.clientY - itemCenterGlobalY, e.clientX - itemCenterGlobalX);
            newRotation = initialRotation + (angleCurrent - angleStart) * (180 / Math.PI);
        } else {
            if (type.includes('r')) newWidth = Math.max(MIN_SIZE, initialWidth + deltaX);
            if (type.includes('b')) newHeight = Math.max(MIN_SIZE, initialHeight + deltaY);
            if (type.includes('l')) {
                const proposedWidth = initialWidth - deltaX;
                if (proposedWidth >= MIN_SIZE) { newWidth = proposedWidth; newX = initialX + deltaX; }
            }
            if (type.includes('t')) {
                const proposedHeight = initialHeight - deltaY;
                if (proposedHeight >= MIN_SIZE) { newHeight = proposedHeight; newY = initialY + deltaY; }
            }
        }
        updateItemSizeRotation(page.id, itemId, newWidth, newHeight, newRotation, newX, newY);
    }, [activeControl, page.id, updateItemSizeRotation]); 

    React.useEffect(() => {
        if (activeControl) {
            window.addEventListener('mousemove', handleControlMove);
            window.addEventListener('mouseup', handleControlEnd);
        }
        return () => {
            window.removeEventListener('mousemove', handleControlMove);
            window.removeEventListener('mouseup', handleControlEnd);
        };
    }, [activeControl, handleControlMove, handleControlEnd]);

    return (
        <div 
            ref={constraintsRef} 
            className={`page ${isLeft ? "left-page" : ""} ${isRight ? "right-page" : ""} 
                       ${isTurning === "forward" ? "turning-forward" : ""} 
                       ${isTurning === "backward" ? "turning-backward" : ""}`}
            onClick={handlePageClick}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
        >
            {page.items?.map((item) => (
                <DraggableWrapper 
                    key={item.id}
                    item={item} 
                    selectedItemId={selectedItemId} 
                    deleteItem={deleteItem} 
                    pageId={page.id}
                    setSelectedItemId={setSelectedItemId}
                    drag={true} 
                    x={item.x || 0} y={item.y || 0} 
                    dragConstraints={constraintsRef}
                    onDragStart={(e) => { e.stopPropagation(); setSelectedItemId(item.id); }}
                    onDragEnd={(finalX, finalY) => { handleStopDrag(page.id, item.id, finalX, finalY); }}
                    onTap={(e) => { e.stopPropagation(); setSelectedItemId(item.id); }} 
                    handleResizeRotateStart={handleResizeRotateStart}
                    activeControl={activeControl}
                    
                    // Feature 2: Pass down field updater for cropping
                    updateItemField={updateItemField}
                />
            ))}

            {/* Feature 4: Corners */}
            {/* Left Page corners: TL and BL */}
            {isLeft && ["tl", "bl"].map((corner) => (
                <div
                    key={corner}
                    className={`corner ${corner} ${hoverCorner === corner ? "folded" : ""}`}
                    onMouseEnter={() => setHoverCorner(corner)}
                    onMouseLeave={() => setHoverCorner(null)}
                    onClick={() => handleCornerClick(corner)}
                />
            ))}
            {/* Right Page corners: TR and BR */}
            {isRight && ["tr", "br"].map((corner) => (
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