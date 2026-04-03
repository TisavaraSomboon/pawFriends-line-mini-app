import type Liff from "@line/liff";

export type LiffProfile = {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
};

export type LiffContextValue = {
  liff: typeof Liff | null;
  isReady: boolean;
  isLoggedIn: boolean;
  profile: LiffProfile | null;
  error: string | null;
};
