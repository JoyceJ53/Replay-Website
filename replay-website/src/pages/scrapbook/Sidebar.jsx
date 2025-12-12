// src/pages/scrapbook/Sidebar.jsx
import React from "react";
import "../../styles/Editing.css";

const tabs = [
  { name: "media", emoji: "🎥" },
  { name: "layout", emoji: "📐" },
  { name: "background", emoji: "🌄" },
  { name: "border", emoji: "⬜" },
  { name: "clipart", emoji: "🖼️" },
  { name: "music", emoji: "🎵" },
  { name: "text", emoji: "🔤" },
];

export default function Sidebar({ selectedTab, setSelectedTab }) {
  return (
    <div className="sidebar">
      {tabs.map(({ name, emoji }) => (
        <div
          key={name}
          className={`tab ${selectedTab === name ? "active" : ""}`}
          onClick={() => setSelectedTab(selectedTab === name ? null : name)}
        >
          <div className="tab-emoji">{emoji}</div>
          <div className="tab-label">{name.charAt(0).toUpperCase() + name.slice(1)}</div>
        </div>
      ))}
    </div>
  );
}
