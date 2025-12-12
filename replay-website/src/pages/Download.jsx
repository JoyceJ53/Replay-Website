import React from 'react';
import '../styles/Download.css';

export default function Download() {
  return (
    <div className="download-hero">
      <div className="download-box">
        <h1 className="download-title">Download Replay Desktop</h1>
        <p className="download-subtitle">Fast and Simple. Works with your Replay Cloud membership.</p>
        <button className="windows-download-button">Download for Windows (.exe)</button>
        <p className="windows-download-description">Windows 10 or newer - v1.0.0 - Released Oct 1, 2025</p>
        <button className="mac-download-button">Download for Mac (.dmg)</button>
        <button className="linux-download-button">Download for Linux (.AppImage)</button>
      </div>
      <p className="download-terms">By downloading, you agree to our Terms of Service and Privacy Policy</p>
    </div>
  );
}
