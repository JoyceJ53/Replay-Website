import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { signOut, updateEmail, updatePassword } from 'firebase/auth';
import { auth } from '../firebase/firebase';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import '../styles/Profile.css';

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Popup states
  const [showDelete1, setShowDelete1] = useState(false);
  const [showDelete2, setShowDelete2] = useState(false);

  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(user?.displayName || "");

  const [showEmailPopup, setShowEmailPopup] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");

  const [showPasswordPopup, setShowPasswordPopup] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert('Logged out successfully!');
    } catch (err) {
      console.error(err);
      alert('Error logging out: ' + err.message);
    }
  };

  if (!user) return <Navigate to="/signin" replace />;

  // Placeholder deletion function
  const finalDelete = () => {
    console.log("Would delete account here.");
    setShowDelete1(false);
    setShowDelete2(false);
  };

  const saveName = () => {
    // Eventually update Firebase displayName
    setEditingName(false);
  };

  const saveEmail = () => {
    if (newEmail !== confirmEmail) {
      alert("Emails do not match");
      return;
    }
    setShowEmailPopup(false);
  };

  const savePassword = () => {
    if (newPassword !== confirmPassword) {
      alert("New passwords do not match");
      return;
    }
    setShowPasswordPopup(false);
  };

  return (
    <div className="profile-page">

      {/* POPUPS */}

      {/* Delete popup step 1 */}
      {showDelete1 && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h3>Delete account?</h3>
            <div className="popup-buttons">
              <button onClick={() => setShowDelete2(true)}>Yes</button>
              <button onClick={() => setShowDelete1(false)}>No</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete popup step 2 */}
      {showDelete2 && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h3>Are you sure? Any information not saved to your computer will be deleted.</h3>
            <div className="popup-buttons">
              <button onClick={finalDelete}>Yes</button>
              <button onClick={() => setShowDelete2(false)}>No</button>
            </div>
          </div>
        </div>
      )}

      {/* Email update popup */}
      {showEmailPopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h3>Update Email</h3>
            <input 
              type="email"
              placeholder="New email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
            <input 
              type="email"
              placeholder="Confirm new email"
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)}
            />
            <div className="popup-buttons">
              <button onClick={saveEmail}>Submit</button>
              <button onClick={() => setShowEmailPopup(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Password update popup */}
      {showPasswordPopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h3>Update Password</h3>
            <input 
              type="password"
              placeholder="Old password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
            <input 
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <input 
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <div className="popup-buttons">
              <button onClick={savePassword}>Submit</button>
              <button onClick={() => setShowPasswordPopup(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CARD */}
      <div className="profile-card">

        {/* LEFT SIDE */}
        <div className="profile-left">

          {!editingName ? (
            <h2 className="profile-username">
              {user.displayName || user.email}
              <span 
                className="name-edit-icon" 
                onClick={() => setEditingName(true)}
              >
                ✏️
              </span>
            </h2>
          ) : (
            <div>
              <input
                className="name-input"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
              <button className="edit-inline" onClick={saveName}>Save</button>
            </div>
          )}

          <button 
            className="profile-delete-btn" 
            onClick={() => setShowDelete1(true)}
          >
            Delete Account
          </button>
        </div>

        {/* DIVIDER */}
        <div className="profile-divider"></div>

        {/* RIGHT SIDE */}
        <div className="profile-right">

          <div className="profile-row">
            <h4>Email</h4>
            <p>{user.email}</p>
            <button 
              className="edit-inline"
              onClick={() => setShowEmailPopup(true)}
            >
              ✏️ Update information
            </button>
          </div>

          <div className="profile-row">
            <h4>Password</h4>
            <p>********</p>
            <button 
              className="edit-inline"
              onClick={() => setShowPasswordPopup(true)}
            >
              ✏️ Update information
            </button>
          </div>

          <div className="profile-row">
            <h4>Account type</h4>
            <p>Replay Plus</p>
            <button 
              className="edit-inline"
              onClick={() => navigate("/pricing")}
            >
              ✏️ Edit Subscription
            </button>
          </div>

          <div className="profile-row">
            <h4>Replay Bookshelf</h4>
            <button 
              className="profile-bookshelf-btn"
              onClick={() => navigate("/scrapbook-style")}
            >
              View Bookshelf
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
