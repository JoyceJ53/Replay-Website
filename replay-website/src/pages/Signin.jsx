// src/pages/Signin.jsx
import React, { useState } from "react";
import { auth, googleProvider } from "../firebase/firebase";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { useAuth } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";
import "../styles/SignIn.css";

function Signin() {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setError(err.message);
    }
  };

  if (user) {
    return <Navigate to="/profile" replace />;
  }

  return (
    <div className="signin-container">
      <div className="signin-card">
        <h2>Sign In</h2>
        {error && <p className="error">{error}</p>}

        <form onSubmit={handleEmailLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="btn-signin">Sign In with Email</button>
        </form>

        <hr />
        

        <button onClick={handleGoogleLogin} className="btn-google">
          <img src="https://www.citypng.com/public/uploads/preview/google-logo-icon-gsuite-hd-701751694791470gzbayltphh.png" alt="Google logo" className="google-logo"/>
          Sign In with Google
        </button>
        <hr />

        <p>Don't have an account? <a style={{ color: "blue" }} href="/signup">Sign Up</a></p>
      </div>
    </div>
  );
}

export default Signin;
