"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  ReactNode,
} from "react";

/* ── Types ── */
type ToastType = "success" | "error" | "info";

type Toast = {
  id: number;
  message: string;
  type: ToastType;
};

type ToastContextValue = {
  toast: (message: string, type?: ToastType) => void;
};

/* ── Context ── */
const ToastContext = createContext<ToastContextValue | null>(null);

/* ── Style map ── */
const STYLES: Record<ToastType, { icon: string; bar: string; iconColor: string }> = {
  success: { icon: "check_circle",  bar: "bg-green-500",  iconColor: "text-green-500"  },
  error:   { icon: "cancel",        bar: "bg-red-500",    iconColor: "text-red-500"    },
  info:    { icon: "info",          bar: "bg-[#e2cfb7]",  iconColor: "text-[#e2cfb7]" },
};

/* ── Provider ── */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, type: ToastType = "info") => {
      const id = ++counter.current;
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => dismiss(id), 3500);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* Toast stack — top-center, above everything */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center gap-2 pointer-events-none w-full max-w-sm px-4">
        {toasts.map((t) => {
          const s = STYLES[t.type];
          return (
            <div
              key={t.id}
              className="pointer-events-auto w-full bg-white rounded-2xl shadow-xl border border-[#f1f5f9] overflow-hidden animate-in fade-in slide-in-from-top-3 duration-200"
            >
              {/* Coloured top bar */}
              <div className={`h-1 w-full ${s.bar}`} />

              <div className="flex items-center gap-3 px-4 py-3">
                <span className={`material-symbols-outlined shrink-0 ${s.iconColor}`} style={{ fontSize: 22 }}>
                  {s.icon}
                </span>
                <p className="flex-1 text-[13px] font-semibold text-[#1e293b] leading-snug">
                  {t.message}
                </p>
                <button
                  onClick={() => dismiss(t.id)}
                  className="shrink-0 w-6 h-6 flex items-center justify-center rounded-full hover:bg-[#f1f5f9] transition-colors"
                >
                  <span className="material-symbols-outlined text-[#94a3b8]" style={{ fontSize: 16 }}>close</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

/* ── Hook ── */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
