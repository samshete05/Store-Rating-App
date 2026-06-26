import React from "react";
import Button from "./Button";
import Card from "./Card";

export default function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <Card className="w-full max-w-xl p-4">
        <div className="flex items-start justify-between gap-3 border-b border-[#eadfcd] pb-3">
          <div>
            <h3 className="app-title text-lg font-bold text-[var(--ink)]">{title}</h3>
          </div>
          <Button variant="secondary" onClick={onClose} className="text-xs">
            Close
          </Button>
        </div>
        <div className="pt-3">{children}</div>
      </Card>
    </div>
  );
}
