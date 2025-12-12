// src/pages/Editing.jsx
import React from "react";
import { useLocation } from "react-router-dom";
import Scrapbook from "./scrapbook/Scrapbook";
import "../styles/scrapbook/Scrapbook.css";

export default function Editing() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const scrapbookId = params.get("scrapbookId");

  if (!scrapbookId) return <div>Please select a scrapbook first.</div>;

  return <Scrapbook scrapbookId={scrapbookId} />;
}
