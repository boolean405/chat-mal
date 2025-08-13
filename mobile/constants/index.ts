import { Platform } from "react-native";

export const APP_NAME = "Chat Mal";
export const APP_TAGLINE = "Explore the World";
export const CS_EMAIL = "chatmalapp@gmail.com";
export const WEBSITE_URL = "https://chatmal.com";

// Replace with your real store URLs / IDs
const IOS_STORE_ID = "1234567890";
const ANDROID_PACKAGE = "com.chat.mal";

export const RATE_APP_URL =
  Platform.OS === "ios"
    ? `itms-apps://itunes.apple.com/app/id${IOS_STORE_ID}?action=write-review`
    : `market://details?id=${ANDROID_PACKAGE}`;

export const PLAY_STORE_WEB = `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE}`;
export const APP_STORE_WEB = `https://apps.apple.com/app/id${IOS_STORE_ID}`;
