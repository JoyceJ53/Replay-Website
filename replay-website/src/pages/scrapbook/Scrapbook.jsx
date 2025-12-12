// src/pages/scrapbook/Scrapbook.jsx
import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../firebase/firebase";
import {
  collection,
  query,
  orderBy,
  getDocs,
  addDoc,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import UploadModal from "./UploadModal";
import Page from "./Page";
import Sidebar from "./Sidebar";
import SubSidebar from "./SubSidebar";
import "../../styles/scrapbook/Scrapbook.css";

export default function Scrapbook({ scrapbookId }) {
  const { user } = useAuth();
  const [pages, setPages] = useState([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  
  const [selectedTab, setSelectedTab] = useState(null);
  const [mediaFiles, setMediaFiles] = useState([]);
  const undoStack = useRef([]);
  const redoStack = useRef([]);

  useEffect(() => {
    if (!user || !scrapbookId) return;

    const fetchData = async () => {
      const pagesQ = query(
        collection(db, "users", user.uid, "scrapbook", scrapbookId, "pages"),
        orderBy("createdAt", "asc")
      );
      const pageSnap = await getDocs(pagesQ);
      const pagesData = pageSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      if (pagesData.length === 0) {
        const first = await addDoc(collection(db, "users", user.uid, "scrapbook", scrapbookId, "pages"), { items: [], createdAt: serverTimestamp() });
        const second = await addDoc(collection(db, "users", user.uid, "scrapbook", scrapbookId, "pages"), { items: [], createdAt: serverTimestamp() });
        setPages([{ id: first.id, items: [] }, { id: second.id, items: [] }]);
      } else {
        setPages(pagesData);
      }

      const subcollections = ["media", "music", "background", "clipart"];
      let allMedia = [];
      for (const sub of subcollections) {
        const q = query(
          collection(db, "users", user.uid, "scrapbook", scrapbookId, sub),
          orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(q);
        const media = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data(), subcollection: sub }));
        allMedia = allMedia.concat(media);
      }

      const builtInMedia = [
        { id: "lion-demo", name: "Lion", url: "https://classroomclipart.com/image/static2/preview2/cute-animal-lion-clipart-33697.jpg", type: "image" },
        { id: "map-demo", name: "World Map", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/World_map_-_low_resolution.svg/1024px-World_map_-_low_resolution.svg.png", type: "image" },
      ];

      setMediaFiles([...allMedia, ...builtInMedia]);
    };

    fetchData();
  }, [user, scrapbookId]);

  const savePage = async (page) => {
    if (!user || !scrapbookId) return;
    try {
      await updateDoc(doc(db, "users", user.uid, "scrapbook", scrapbookId, "pages", page.id), {
        items: page.items,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("Failed to save page:", err);
    }
  };

  // NEW: Function to handle when an item stops dragging
  const handleStopDrag = (pageId, itemId, newX, newY) => {
    setPages((prevPages) => {
      // Save undo state
      undoStack.current.push(JSON.stringify(prevPages));

      const updatedPages = prevPages.map((page) => {
        if (page.id !== pageId) return page;

        // Find the item and update its position (x, y)
        const updatedItems = page.items.map((item) => {
            if (item.id === itemId) {
                return { ...item, x: newX, y: newY };
            }
            return item;
        });

        const updatedPage = { ...page, items: updatedItems };
        savePage(updatedPage); // Persist position change
        return updatedPage;
      });
      return updatedPages;
    });
  };

  // NEW: Function to handle when an item is deleted
  const deleteItem = (pageId, itemId) => {
    setPages((prevPages) => {
      // Save undo state
      undoStack.current.push(JSON.stringify(prevPages));
      
      const updatedPages = prevPages.map((page) => {
        if (page.id !== pageId) return page;

        // Filter out the item to delete
        const updatedItems = page.items.filter((item) => item.id !== itemId);

        return { ...page, items: updatedItems };
      });

      // Find the page that was just edited and save it to the database
      const updatedPage = updatedPages.find(p => p.id === pageId);
      if (updatedPage) {
        savePage(updatedPage);
      }

      return updatedPages;
    });
  };


  const addNewPage = async () => {
    if (!user || !scrapbookId) return;
    // create locally immediately
    const tempId = "temp-" + Date.now() + Math.random();
    const newLocal = { id: tempId, items: [] };
    setPages((prev) => [...prev, newLocal]);
    // persist to firestore and replace id when done
    try {
      const docRef = await addDoc(collection(db, "users", user.uid, "scrapbook", scrapbookId, "pages"), {
        items: [],
        createdAt: serverTimestamp(),
      });
      setPages((prev) => prev.map((p) => (p.id === tempId ? { id: docRef.id, items: [] } : p)));
    } catch (err) {
      console.error("Add page failed:", err);
    }
  };

  const handlePageChange = (newPageIndex) => {
    if (newPageIndex < 0) newPageIndex = 0;
    if (newPageIndex > pages.length - 1) newPageIndex = pages.length - 1;
    setCurrentPageIndex(newPageIndex);
    if (user && scrapbookId) {
      updateDoc(doc(db, "users", user.uid, "scrapbook", scrapbookId), { lastViewedPage: newPageIndex }).catch(() => {});
    }
  };

  const flipForward = async () => {
    const nextIndex = currentPageIndex + 2;
    if (nextIndex >= pages.length) {
      await addNewPage(); // ensures at least one new page exists
    }
    handlePageChange(currentPageIndex + 2);
  };

  const flipBackward = () => {
    handlePageChange(Math.max(0, currentPageIndex - 2));
  };

const handleDropMedia = (pageId, droppedItem, x, y) => {
    setPages((prevPages) => {
        // 1. Save undo state
        undoStack.current.push(JSON.stringify(prevPages)); 

        const updatedPages = prevPages.map((page) => {
            if (page.id !== pageId) return page;

            // 2. Create the new item with dropped position
            const newItem = {
                ...droppedItem,
                x: x, 
                y: y, 
            };

            const updatedPage = {
                ...page,
                items: [...(page.items || []), newItem],
            };
            
            // 3. Persist the change (assuming you have a savePage function)
            savePage(updatedPage); 
            
            return updatedPage;
        });

        return updatedPages;
    });
};
const updateItemSizeRotation = (pageId, itemId, newW, newH, newR, newX, newY) => {
    setPages((prevPages) => {
        // NOTE: For performance, we don't save to the database on every mousemove, 
        // but we do update the local state immediately.

        const updatedPages = prevPages.map((page) => {
            if (page.id !== pageId) return page;

            const updatedItems = page.items.map((item) => {
                if (item.id === itemId) {
                    const updatedItem = { 
                        ...item, 
                        width: newW, 
                        height: newH, 
                        rotation: newR, // New rotation
                        x: newX,       // Updated X position 
                        y: newY,       // Updated Y position
                    };
                    
                    // You might want to save the final state to the DB here if needed
                    // (e.g., if you check if activeControl is null in Page.jsx's handleControlEnd 
                    // and trigger a final save via a new prop). 
                    // For now, we rely on the next handleStopDrag or another save event.
                    
                    return updatedItem;
                }
                return item;
            });

            return { ...page, items: updatedItems };
        });

        return updatedPages;
    });
};

  return (
    <div className="editing-wrapper">
      <div className="horizontal-layout">
        <Sidebar className="sidebar" selectedTab={selectedTab} setSelectedTab={setSelectedTab} />
        <SubSidebar
          className="subsidebar"
          selectedTab={selectedTab}
          mediaFiles={mediaFiles}
          setMediaFiles={setMediaFiles}
          pages={pages}
          setPages={setPages}
          undoStack={undoStack}
          redoStack={redoStack}
          currentPageIndex={currentPageIndex}
          scrapbookId={scrapbookId}
        />
        <div className="scrapbook-canvas-wrapper">
          <div className="scrapbook-pages">
            {pages.map((page, idx) => (
              <Page
                key={page.id}
                page={page}
                savePage={savePage}
                isCurrent={idx === currentPageIndex || idx === currentPageIndex + 1}
                index={idx}
                totalPages={pages.length}
                setPages={setPages}
                undoStack={undoStack}
                redoStack={redoStack}
                onFlipForward={flipForward}
                onFlipBackward={flipBackward}
                currentPageIndex={currentPageIndex}
                addNewPage={addNewPage}
                handleStopDrag={handleStopDrag} 
                deleteItem={deleteItem}
                handleDropMedia={handleDropMedia}
                updateItemSizeRotation={updateItemSizeRotation}
              />
            ))}
          </div>

          <button className="add-page-button" onClick={addNewPage} aria-label="Add page">+</button>
        </div>
      </div>
    </div>
  );
}