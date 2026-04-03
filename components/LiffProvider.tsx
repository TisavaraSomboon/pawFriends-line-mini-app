"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { LiffContextValue, LiffProfile } from "@/lib/liff";
import type Liff from "@line/liff";

const LiffContext = createContext<LiffContextValue>({
  liff: null,
  isReady: false,
  isLoggedIn: false,
  profile: null,
  error: null,
});

export function useLiff() {
  return useContext(LiffContext);
}

export default function LiffProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [liff, setLiff] = useState<typeof Liff | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profile, setProfile] = useState<LiffProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initLiff = async () => {
      try {
        const liffModule = (await import("@line/liff")).default;

        await liffModule.init({
          liffId: process.env.NEXT_PUBLIC_LIFF_ID!,
        });

        const loggedIn = liffModule.isLoggedIn();
        setIsLoggedIn(loggedIn);

        if (loggedIn) {
          const p = await liffModule.getProfile();
          setProfile({
            userId: p.userId,
            displayName: p.displayName,
            pictureUrl: p.pictureUrl,
            statusMessage: p.statusMessage,
          });
        }

        setLiff(liffModule);
        setIsReady(true);
      } catch (err) {
        console.error("[LIFF] init failed:", err);
        setError(err instanceof Error ? err.message : "LIFF init failed");
        setIsReady(true); // unblock the UI even on error
      }
    };

    initLiff();
  }, []);

  if (!isReady) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#f7f7f6]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[rgba(226,207,183,0.4)] flex items-center justify-center animate-pulse">
            <span className="text-2xl">🐾</span>
          </div>
          <p className="text-[13px] font-semibold text-[#94a3b8]">
            Loading PawFriends…
          </p>
        </div>
      </div>
    );
  }

  return (
    <LiffContext.Provider value={{ liff, isReady, isLoggedIn, profile, error }}>
      {children}
    </LiffContext.Provider>
  );
}
