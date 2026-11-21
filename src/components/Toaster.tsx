"use client";

import { useEffect, useState } from "react";

type Toast = { id: number; message: string; type: "success" | "error" | "info" };

let listeners: ((t: Toast) => void)[] = [];
let counter = 0;

export function toast(message: string, type: Toast["type"] = "info") {
  const t: Toast = { id: ++counter, message, type };
  listeners.forEach((l) => l(t));
}

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const handler = (t: Toast) => {
      setToasts((prev) => [...prev, t]);
      setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== t.id)), 3500);
    };
    listeners.push(handler);
    return () => {
      listeners = listeners.filter((l) => l !== handler);
    };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-[100] space-y-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast ${
            t.type === "success"
              ? "border-green-300"
              : t.type === "error"
              ? "border-red-300"
              : "border-border"
          }`}
        >
          <span
            className={
              t.type === "success"
                ? "text-green-600"
                : t.type === "error"
                ? "text-red-600"
                : "text-primary-dark"
            }
          >
            {t.message}
          </span>
        </div>
      ))}
    </div>
  );
}