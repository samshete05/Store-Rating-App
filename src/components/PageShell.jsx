import React from "react";
import { NavLink } from "react-router-dom";
import Button from "./Button";
import Card from "./Card";
import { formatRole } from "../utils/helpers";

const navStyles = ({ isActive }) =>
  `block rounded-2xl px-4 py-3 text-sm font-semibold transition ${
    isActive
      ? "bg-[var(--accent)] text-white shadow-[0_12px_24px_rgba(168,68,35,0.25)]"
      : "text-[#6f6250] hover:bg-[#f6ece0] hover:text-[#4a3f31]"
  }`;

export default function PageShell({ user, title, subtitle, navItems, onLogout, children }) {
  return (
    <div className="mx-auto min-h-screen max-w-[1440px] px-4 py-4 sm:px-5 lg:px-6">
      <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="glass-panel sticky top-4 h-fit rounded-2xl p-3">
          <div className="rounded-2xl bg-[#302519] px-4 py-4 text-white shadow-[0_16px_30px_rgba(39,27,18,0.28)]">
            <div className="flex items-center gap-2">
              <div className="app-logo" aria-hidden="true">◎</div>
              <div className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#d8c9b7]">
                StoreMark
              </div>
            </div>
            <div className="app-title mt-3 text-xl font-bold leading-tight">
              Smart store insights.
            </div>
            <div className="mt-3 rounded-2xl bg-white/10 px-3 py-2 text-xs text-[#f2e9de]">
              {user?.name}
              <div className="mt-1 text-xs uppercase tracking-[0.2em] text-[#f6b892]">
                {formatRole(user?.role)}
              </div>
            </div>
          </div>

          <nav className="mt-3 space-y-1.5">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} className={navStyles}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <Card className="mt-3 surface-tight">
            <div className="text-sm font-semibold text-[var(--ink)]">Session</div>
            <p className="mt-1.5 text-tight text-[#796b58]">
              Signed in as <span className="font-semibold text-[var(--ink)]">{user?.email}</span>
            </p>
            <Button variant="secondary" className="mt-3 w-full text-xs" onClick={onLogout}>
              Logout
            </Button>
          </Card>
        </aside>

        <main className="space-y-4">
          <Card className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between surface-tight">
            <div>
              <div className="text-xs uppercase tracking-[0.24em] text-[#9f8163]">Dashboard</div>
              <h1 className="app-title mt-1.5 text-2xl font-bold text-[var(--ink)]">{title}</h1>
              {subtitle ? <p className="mt-1.5 max-w-3xl text-tight text-[#756955]">{subtitle}</p> : null}
            </div>
          </Card>
          {children}
        </main>
      </div>
    </div>
  );
}
