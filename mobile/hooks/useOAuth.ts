import { useEffect } from "react";
import { Settings } from "react-native-fbsdk-next";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { GOOGLE_IOS_CLIENT_ID, GOOGLE_WEB_CLIENT_ID } from "@/constants";

export function useOAuth() {
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: GOOGLE_WEB_CLIENT_ID,
      iosClientId: GOOGLE_IOS_CLIENT_ID,
      // profileImageSize: 150,
    });
  }, []);

  // Facebook oAuth
  useEffect(() => {
    Settings.initializeSDK();
  }, []);
}
