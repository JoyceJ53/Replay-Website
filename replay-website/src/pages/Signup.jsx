// src/pages/Signup.jsx
import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import "../styles/Signup.css";

export default function Signup() {
  const { signupWithEmail, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Add user to Firestore
  const addUserToFirestore = async (user) => {
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(userRef);

    if (!docSnap.exists()) {
      await setDoc(userRef, {
        userId: user.uid,
        email: user.email,
        displayName: user.displayName || "",
        createdAt: new Date(),
      });
      console.log("User added to Firestore!");
    } else {
      console.log("User already exists in Firestore.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      return setError("Passwords do not match");
    }

    try {
      setLoading(true);
      const userCredential = await signupWithEmail(email, password);
      const user = userCredential.user; // Get Firebase user
      await addUserToFirestore(user);
      navigate("/profile");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError("");
    try {
      const result = await loginWithGoogle();
      const user = result.user; 
      await addUserToFirestore(user);
      navigate("/profile");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="signin-container">
      <div className="signin-card">
        <h2>Create an Account</h2>
        {error && <p className="error">{error}</p>}

        <form onSubmit={handleSubmit}>
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
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            className="btn-signin"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Sign Up with Email"}
          </button>
        </form>

        <hr />

        <button onClick={handleGoogleSignup} className="btn-google">
          <img
            src="https://www.citypng.com/public/uploads/preview/google-logo-icon-gsuite-hd-701751694791470gzbayltphh.png"
            alt="Google logo"
            className="google-logo"
          />
          Sign Up with Google
        </button>

        <p style={{ marginTop: "1rem" }}>
          Already have an account?{" "}
          <Link to="/signin" style={{ color: "blue" }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
