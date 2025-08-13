import { Platform } from "react-native";

export const WEBSITE_URL = "https://chatmal.app"; // ← change to your site
export const PRIVACY_URL = "https://chatmal.app/privacy"; // or your in-app route
export const TERMS_URL = "https://chatmal.app/terms";
export const LICENSES_URL = "https://chatmal.app/licenses"; // or local screen route

// Replace with your real store URLs / IDs
const IOS_STORE_ID = "1234567890";
const ANDROID_PACKAGE = "com.chat.mal";

export const RATE_APP_URL =
  Platform.OS === "ios"
    ? `itms-apps://itunes.apple.com/app/id${IOS_STORE_ID}?action=write-review`
    : `market://details?id=${ANDROID_PACKAGE}`;

export const PLAY_STORE_WEB = `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE}`;
export const APP_STORE_WEB = `https://apps.apple.com/app/id${IOS_STORE_ID}`;
