import React, { useState, useRef, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/firebase';
import '../styles/Layout.css';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileRef = useRef(null);

  // Only remove flex for /editing page
  const isEditingPage = location.pathname === '/editing';

  // Close the popup if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert('Logged out successfully!');
      navigate('/signin'); // redirect to sign-in page
    } catch (err) {
      console.error(err);
      alert('Error logging out: ' + err.message);
    }
  };

  const goToProfile = () => {
    navigate('/profile');
    setShowProfileMenu(false); // close the popup
  };

  return (
    <div className="layout">
      {/* Header / Navbar */}
      <header className="header">
        <nav className="navbar">
          <Link to="/" className="brand">Replay</Link>
          <div className="nav-links">
            <Link to="/">Home</Link>
            <Link to="/download">Download</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/scrapbook-style">Create</Link>
            <Link to="/pricing">Price</Link>
            <Link to="/cart">🛒</Link>

            {/* Profile popup */}
            <div className="profile-wrapper" ref={profileRef}>
              <button
                className="profile-button"
                onClick={() => {
                  if (!user) {
                    navigate('/signin');
                  } else {
                    setShowProfileMenu((prev) => !prev);
                  }
                }}
              >
                👤
              </button>

              {user && showProfileMenu && (
                <div className="profile-menu">
                  <button onClick={goToProfile}>Profile Settings</button>
                  <button onClick={handleLogout}>Logout</button>
                </div>
              )}
            </div>

          </div>
        </nav>
      </header>

      {/* Main content */}
      <main className={`main-content ${isEditingPage ? 'no-flex' : ''}`}>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <p>&copy; {new Date().getFullYear()} Replay Website</p>
          <div className="footer-links">
            <Link to="/faq">FAQ</Link> |{' '}
            <Link to="/contact">Contact</Link> |{' '}
            <Link to="/download">Download</Link> |{' '}
            <Link to="/privacy-policy">Privacy Policy</Link> |{' '}
            <Link to="/terms-of-service">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
