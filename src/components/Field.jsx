import React from "react";

const baseClass =
  "mt-1 w-full rounded-xl border border-[var(--line)] bg-[var(--panel)] px-3 py-2 text-xs text-[var(--ink)] shadow-sm transition placeholder:text-[#9f917d] focus:border-[#cf8758] focus:outline-none focus:ring-2 focus:ring-[#f0c7ac]";

export function Field({
  label,
  error,
  hint,
  className = "",
  children,
  ...props
}) {
  return (
    <label className={`block ${className}`}>
      <span className="text-xs font-medium text-[#5d5141]">{label}</span>
      {children || <input className={baseClass} {...props} />}
      {hint ? <p className="mt-1 text-[11px] text-[#8b7d69]">{hint}</p> : null}
      {error ? <p className="mt-1 text-[11px] font-medium text-rose-600">{error}</p> : null}
    </label>
  );
}

export function TextAreaField({ rows = 4, ...props }) {
  const { label, error, hint, className = "", ...rest } = props;
  return (
    <label className={`block ${className}`}>
      <span className="text-xs font-medium text-[#5d5141]">{label}</span>
      <textarea rows={rows} className={baseClass} {...rest} />
      {hint ? <p className="mt-1 text-[11px] text-[#8b7d69]">{hint}</p> : null}
      {error ? <p className="mt-1 text-[11px] font-medium text-rose-600">{error}</p> : null}
    </label>
  );
}

export function SelectField({ children, ...props }) {
  const { label, error, hint, className = "", ...rest } = props;
  return (
    <label className={`block ${className}`}>
      <span className="text-xs font-medium text-[#5d5141]">{label}</span>
      <select className={baseClass} {...rest}>
        {children}
      </select>
      {hint ? <p className="mt-1 text-[11px] text-[#8b7d69]">{hint}</p> : null}
      {error ? <p className="mt-1 text-[11px] font-medium text-rose-600">{error}</p> : null}
    </label>
  );
}
