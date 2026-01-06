// src/pages/scrapbook/Scrapbook.jsx
import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../firebase/firebase";
import {
  collection, query, orderBy, getDocs, addDoc, doc, serverTimestamp, updateDoc,
} from "firebase/firestore";
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
  const [selectedItemId, setSelectedItemId] = useState(null);

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
        // Initial setup
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


  
  // --- ITEM UPDATES (TEXT & CROP) ---
  const updateItemField = (pageId, itemId, field, value) => {
    setPages((prevPages) => {
        const updatedPages = prevPages.map((page) => {
            if (page.id !== pageId) return page;
            const updatedItems = page.items.map((item) => {
                if (item.id === itemId) {
                    return { ...item, [field]: value };
                }
                return item;
            });
            const newPage = { ...page, items: updatedItems };
            savePage(newPage);
            return newPage;
        });
        return updatedPages;
    });
  };

  const handleStopDrag = (pageId, itemId, newX, newY) => {
    setPages((prevPages) => {
      undoStack.current.push(JSON.stringify(prevPages));
      const updatedPages = prevPages.map((page) => {
        if (page.id !== pageId) return page;
        const updatedItems = page.items.map((item) => (item.id === itemId ? { ...item, x: newX, y: newY } : item));
        const updatedPage = { ...page, items: updatedItems };
        savePage(updatedPage);
        return updatedPage;
      });
      return updatedPages;
    });
  };

  const deleteItem = (pageId, itemId) => {
    setPages((prevPages) => {
      undoStack.current.push(JSON.stringify(prevPages));
      const updatedPages = prevPages.map((page) => {
        if (page.id !== pageId) return page;
        const updatedItems = page.items.filter((item) => item.id !== itemId);
        const updatedPage = { ...page, items: updatedItems };
        savePage(updatedPage);
        return updatedPage;
      });
      return updatedPages;
    });
    setSelectedItemId(null);
  };

  const addNewPage = async () => {
    if (!user || !scrapbookId) return;
    const tempId = "temp-" + Date.now();
    setPages((prev) => [...prev, { id: tempId, items: [] }]);
    try {
      const docRef = await addDoc(collection(db, "users", user.uid, "scrapbook", scrapbookId, "pages"), { items: [], createdAt: serverTimestamp() });
      setPages((prev) => prev.map((p) => (p.id === tempId ? { id: docRef.id, items: [] } : p)));
    } catch (err) { console.error(err); }
  };

  const handlePageChange = (newPageIndex) => {
    if (newPageIndex < 0) newPageIndex = 0;
    if (newPageIndex > pages.length - 1) newPageIndex = pages.length - 1; // Actually, allow even if odd
    setCurrentPageIndex(newPageIndex);
  };

  const flipForward = async () => {
    const nextIndex = currentPageIndex + 2;
    if (nextIndex >= pages.length) await addNewPage();
    handlePageChange(nextIndex);
  };

  const flipBackward = () => {
    handlePageChange(Math.max(0, currentPageIndex - 2));
  };

  const handleDropMedia = (pageId, droppedItem, x, y) => {
    setPages((prevPages) => {
        undoStack.current.push(JSON.stringify(prevPages));
        const updatedPages = prevPages.map((page) => {
            if (page.id !== pageId) return page;
            const newItem = { 
                ...droppedItem, x, y, 
                fontSize: 16, fontFamily: 'Arial', content: droppedItem.content || "Double click to edit",
                objectPositionX: 50, objectPositionY: 50,
                width: droppedItem.width || 200, height: droppedItem.height || 200
            };
            const updatedPage = { ...page, items: [...(page.items || []), newItem] };
            savePage(updatedPage);
            return updatedPage;
        });
        return updatedPages;
    });
  };

  const updateItemSizeRotation = (pageId, itemId, newW, newH, newR, newX, newY) => {
    setPages((prevPages) => {
        return prevPages.map((page) => {
            if (page.id !== pageId) return page;
            const updatedItems = page.items.map((item) => {
                if (item.id === itemId) {
                    return { ...item, width: newW, height: newH, rotation: newR, x: newX, y: newY };
                }
                return item;
            });
            return { ...page, items: updatedItems };
        });
    });
  };

  const getSelectedItem = () => {
      if(!selectedItemId) return null;
      for(let p of pages) {
          const item = p.items?.find(i => i.id === selectedItemId);
          if(item) return { item, pageId: p.id };
      }
      return null;
  }

  return (
    <div className="editing-wrapper">
      <div className="horizontal-layout">
        <Sidebar selectedTab={selectedTab} setSelectedTab={setSelectedTab} />
        
        <SubSidebar
          selectedTab={selectedTab}
          mediaFiles={mediaFiles}
          setMediaFiles={setMediaFiles}
          scrapbookId={scrapbookId}
          selectedItemData={getSelectedItem()}
          updateItemField={updateItemField}
        />

        <div className="scrapbook-canvas-wrapper">
          <div className="scrapbook-pages">
            {pages.map((page, idx) => (
              <Page
                key={page.id}
                page={page}
                isCurrent={idx === currentPageIndex || idx === currentPageIndex + 1}
                index={idx}
                currentPageIndex={currentPageIndex}
                totalPages={pages.length}
                onFlipForward={flipForward}
                onFlipBackward={flipBackward}
                addNewPage={addNewPage}
                
                deleteItem={deleteItem}
                handleDropMedia={handleDropMedia}
                handleStopDrag={handleStopDrag}
                updateItemSizeRotation={updateItemSizeRotation}
                
                selectedItemId={selectedItemId}
                setSelectedItemId={setSelectedItemId}
                updateItemField={updateItemField}
              />
            ))}
          </div>
          <button className="add-page-button" onClick={addNewPage}>+</button>
        </div>
      </div>
    </div>
  );
}