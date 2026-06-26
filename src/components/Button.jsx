import React from "react";

const variants = {
  primary:
    "bg-[var(--accent)] text-white shadow-[0_12px_24px_rgba(168,68,35,0.24)] hover:bg-[var(--accent-strong)] focus-visible:ring-[var(--accent)]",
  secondary:
    "bg-[var(--panel)] text-[var(--ink)] border border-[var(--line)] hover:bg-[var(--panel-strong)] focus-visible:ring-[#9e8f78]",
  soft:
    "bg-[#f2e6d8] text-[#704f39] border border-[#e7d5c0] hover:bg-[#ecdcc7] focus-visible:ring-[#d0b08f]",
  danger:
    "bg-rose-600 text-white hover:bg-rose-500 focus-visible:ring-rose-500",
};

export default function Button({
  children,
  type = "button",
  variant = "primary",
  className = "",
  ...props
}) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center rounded-lg px-3.5 py-2 text-xs font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
