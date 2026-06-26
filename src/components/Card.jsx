import React from "react";

export default function Card({ children, className = "" }) {
  return (
    <div className={`glass-panel grain-overlay rounded-2xl p-4 ${className}`}>{children}</div>
  );
}
