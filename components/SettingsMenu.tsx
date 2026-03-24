"use client";

import { useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useLogout } from "@/lib/queries";

type MenuItem = {
  icon: string;
  label: string;
  onClick: () => void;
  danger?: boolean;
};

type SettingsMenuProps = {
  open: boolean;
  onClose: () => void;
  anchorRef?: React.RefObject<HTMLButtonElement | null>;
};

export default function SettingsMenu({
  open,
  onClose,
  anchorRef,
}: SettingsMenuProps) {
  const router = useRouter();
  const { mutateAsync: logout } = useLogout();
  const menuRef = useRef<HTMLDivElement>(null);
  const mobileSheetRef = useRef<HTMLDivElement>(null);

  // Close on outside click — desktop only. Must also exclude the mobile sheet
  // (portalled to body, so NOT inside menuRef) to avoid killing click events.
  useEffect(() => {
    if (!open) return;
    function handlePointerDown(e: PointerEvent) {
      if (
        menuRef.current?.contains(e.target as Node) ||
        anchorRef?.current?.contains(e.target as Node) ||
        mobileSheetRef.current?.contains(e.target as Node)
      )
        return;
      onClose();
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open, onClose, anchorRef]);

  const items: MenuItem[] = [
    {
      icon: "logout",
      label: "Logout",
      danger: true,
      onClick: () => {
        onClose();
        logout().then(() => router.replace("/login"));
      },
    },
  ];

  if (!open) return null;

  return (
    <>
      {/* ── Mobile: bottom sheet — portalled to body to escape stacking context ── */}
      {createPortal(
        <div ref={mobileSheetRef} className="sm:hidden">
          {/* Backdrop — captures outside taps to close */}
          <div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150"
            onClick={onClose}
          >
            {/* Sheet — child of backdrop; stopPropagation prevents taps bubbling to onClose */}
            <div
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl pb-safe animate-in slide-in-from-bottom duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-[#e2e8f0]" />
              </div>

              <div className="px-4 pt-2 pb-6 flex flex-col gap-1">
                {items.map((item) => (
                  <button
                    key={item.label}
                    onClick={(e) => {
                      e.preventDefault();
                      item.onClick();
                    }}
                    className={`flex items-center gap-3 w-full px-4 py-3.5 rounded-xl text-[15px] font-semibold transition-colors active:scale-[0.98] ${
                      item.danger
                        ? "text-red-500 hover:bg-red-50"
                        : "text-[#1e293b] hover:bg-[rgba(226,207,183,0.2)]"
                    }`}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: 20 }}
                    >
                      {item.icon}
                    </span>
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>,
        document.body,
      )}

      {/* ── Desktop: dropdown (no portal needed — stacking context is fine on desktop) ── */}
      <div
        ref={menuRef}
        className="hidden sm:block absolute right-0 top-full mt-2 w-44 bg-white rounded-2xl shadow-xl border border-[#f1f5f9] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150"
      >
        {items.map((item) => (
          <button
            key={item.label}
            onClick={item.onClick}
            className={`flex items-center gap-2.5 w-full px-4 py-3 text-[13px] font-semibold transition-colors ${
              item.danger
                ? "text-red-500 hover:bg-red-50"
                : "text-[#1e293b] hover:bg-[rgba(226,207,183,0.15)]"
            }`}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 18 }}
            >
              {item.icon}
            </span>
            {item.label}
          </button>
        ))}
      </div>
    </>
  );
}
