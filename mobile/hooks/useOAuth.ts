import { useEffect } from "react";
import { Settings } from "react-native-fbsdk-next";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

export function useOAuth() {
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
      // profileImageSize: 150,
    });
  }, []);

  // Facebook oAuth
  useEffect(() => {
    Settings.initializeSDK();
  }, []);
}
