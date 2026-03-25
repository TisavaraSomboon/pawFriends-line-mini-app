/**
 * Feature flags
 * Set the corresponding env var to "true" to enable a flag in production.
 * All flags default to false (POC-safe).
 */
export const FLAGS = {
  /** Email OTP verification step before login / register. Off during POC. */
  OTP_VERIFICATION: process.env.NEXT_PUBLIC_ENABLE_OTP === "true",

  /**
   * Password field on login / register.
   * When false (default), users sign in with email only — password is
   * auto-derived server-side. Enable this for production auth.
   */
  PASSWORD_AUTH: process.env.NEXT_PUBLIC_ENABLE_PASSWORD_AUTH === "true",
} as const;
