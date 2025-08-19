// lib/constants.ts
export const APP_NAME = "Chat Mal";

// Expose via NEXT_PUBLIC_CS_EMAIL for easy environment overrides
export const CS_EMAIL =
  process.env.NEXT_PUBLIC_CS_EMAIL || "chatmalapp@gmail.com";

// Keep key legal dates in one place
export const PRIVACY_EFFECTIVE_DATE = "February 1, 2025";
export const PRIVACY_LAST_UPDATED = "February 1, 2025";
