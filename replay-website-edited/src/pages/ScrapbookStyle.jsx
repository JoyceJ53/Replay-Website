import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  doc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import "../styles/ScrapbookStyle.css";

export default function ScrapbookStyle() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [scrapbooks, setScrapbooks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newScrapbookName, setNewScrapbookName] = useState("");
  const [coverFile, setCoverFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch user's scrapbooks
  useEffect(() => {
    if (!user) return;

    const fetchScrapbooks = async () => {
      const q = query(
        collection(db, "users", user.uid, "scrapbook"),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      const books = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setScrapbooks(books);
    };

    fetchScrapbooks();
  }, [user]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setScrapbooks((prev) =>
        prev.map((b) => ({ ...b, showMenu: false }))
      );
    };

    window.addEventListener("click", handleClickOutside);
    return () => {
      window.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const handleCreateNew = async () => {
    if (!newScrapbookName.trim()) return;

    setLoading(true);
    try {
      let coverURL = null;

      if (coverFile) {
        const fileToBase64 = (file) => {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
          });
        };
        coverURL = await fileToBase64(coverFile);
      }

      const docRef = await addDoc(
        collection(db, "users", user.uid, "scrapbook"),
        {
          title: newScrapbookName.trim(),
          coverURL,
          createdAt: serverTimestamp(),
        }
      );

      setNewScrapbookName("");
      setCoverFile(null);
      setShowModal(false);

      navigate(`/editing?scrapbookId=${docRef.id}`);
    } catch (err) {
      console.error("Error creating scrapbook:", err);
      alert("Failed to create scrapbook: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenScrapbook = (scrapbookId) => {
    navigate(`/editing?scrapbookId=${scrapbookId}`);
  };

  const handleDeleteScrapbook = async (scrapbookId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this scrapbook? This cannot be undone."
    );
    if (!confirmDelete) return;

    try {
      const subcollections = ["media", "music", "background", "clipart"];
      for (const sub of subcollections) {
        const q = query(
          collection(db, "users", user.uid, "scrapbook", scrapbookId, sub)
        );
        const snapshot = await getDocs(q);
        for (const docSnap of snapshot.docs) {
          await deleteDoc(
            doc(db, "users", user.uid, "scrapbook", scrapbookId, sub, docSnap.id)
          );
        }
      }

      await deleteDoc(doc(db, "users", user.uid, "scrapbook", scrapbookId));

      setScrapbooks((prev) => prev.filter((book) => book.id !== scrapbookId));
    } catch (err) {
      console.error("Error deleting scrapbook:", err);
      alert("Failed to delete scrapbook: " + err.message);
    }
  };

  return (
    <div className="scrapbook-creation-container">
      <h1>Scrapbooks</h1>

      <div className="scrapbook-options-container">
        {/* Create New Card */}
        <div
          className="scrapbook-card create-new-card"
          onClick={() => setShowModal(true)}
        >
          <div className="scrapbook-card-header">
            <h3 className="scrapbook-card-title">Create New</h3>
          </div>
          <hr />
          <div className="scrapbook-card-image-placeholder no-cover-placeholder">
            +
          </div>
          <button
            className="scrapbook-card-button"
            onClick={(e) => {
              e.stopPropagation();
              setShowModal(true);
            }}
          >
            Create
          </button>
        </div>

        {scrapbooks.map((book) => (
          <div className="scrapbook-card" key={book.id}>
            <div className="scrapbook-card-header">
              <h3 className="scrapbook-card-title">{book.title}</h3>
              <div className="card-menu" onClick={(e) => e.stopPropagation()}>
                <span
                  className="menu-dot"
                  onClick={() =>
                    setScrapbooks((prev) =>
                      prev.map((b) =>
                        b.id === book.id
                          ? { ...b, showMenu: !b.showMenu }
                          : b
                      )
                    )
                  }
                >
                  ⋮
                </span>
                {book.showMenu && (
                  <div className="menu-popup">
                    <button onClick={() => handleDeleteScrapbook(book.id)}>
                      Delete
                    </button>
                    <label className="cover-img-btn">
                      Edit Cover Image
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={async (e) => {
                          if (!e.target.files[0]) return;
                          const file = e.target.files[0];
                          const reader = new FileReader();
                          reader.readAsDataURL(file);
                          reader.onload = async () => {
                            try {
                              await setDoc(
                                doc(db, "users", user.uid, "scrapbook", book.id),
                                { ...book, coverURL: reader.result },
                                { merge: true }
                              );
                              setScrapbooks((prev) =>
                                prev.map((b) =>
                                  b.id === book.id
                                    ? { ...b, coverURL: reader.result }
                                    : b
                                )
                              );
                            } catch (err) {
                              console.error(err);
                              alert("Failed to update cover: " + err.message);
                            }
                          };
                        }}
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>

            <hr />

            <div className="scrapbook-card-image-placeholder">
              {book.coverURL ? (
                <img
                  src={book.coverURL}
                  alt="Cover"
                  className="scrapbook-cover-image"
                />
              ) : (
                <div className="no-cover-placeholder">Image</div>
              )}
            </div>

            <button
              className="scrapbook-card-button"
              onClick={() => handleOpenScrapbook(book.id)}
              style={{ marginTop: "auto" }}
            >
              Edit Scrapbook
            </button>
          </div>
        ))}
      </div>

      {/* Modal for Create New */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Create New Scrapbook</h2>
            <input
              type="text"
              placeholder="Enter scrapbook name"
              value={newScrapbookName}
              onChange={(e) => setNewScrapbookName(e.target.value)}
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setCoverFile(e.target.files[0])}
            />
            <button onClick={handleCreateNew} disabled={loading}>
              {loading ? "Creating..." : "Create"}
            </button>
            <button onClick={() => setShowModal(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
