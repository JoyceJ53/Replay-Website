// src/pages/scrapbook/AudioPlayer.jsx (Confirmed Structure)

import React, { useRef, useState } from "react";
import "../../styles/scrapbook/AudioPlayer.css";

export default function AudioPlayer({ src }) {
  // ...
  return (
    <div className="audio-player">
      <button onClick={togglePlay}>{playing ? "Pause" : "Play"}</button>
      <audio ref={audioRef} src={src} style={{ width: '100%' }}/> {/* Added inline style for safety */}
    </div>
  );
}