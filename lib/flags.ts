/**
 * Feature flags
 * Set the corresponding env var to "true" to enable a flag in production.
 * All flags default to false (POC-safe).
 */
export const FLAGS = {
  /** Email OTP verification step before login / register. Off during POC. */
  OTP_VERIFICATION: process.env.NEXT_PUBLIC_ENABLE_OTP === "true",
} as const;
