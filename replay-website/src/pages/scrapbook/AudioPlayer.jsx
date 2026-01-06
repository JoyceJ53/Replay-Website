// src/pages/scrapbook/AudioPlayer.jsx

import React, { useRef, useState } from "react";
import "../../styles/scrapbook/AudioPlayer.css";

export default function AudioPlayer({ src }) {
// Add audio player code here
  return (
    <div className="audio-player">
      <button onClick={togglePlay}>{playing ? "Pause" : "Play"}</button>
      <audio ref={audioRef} src={src} style={{ width: '100%' }}/>
    </div>
  );
}