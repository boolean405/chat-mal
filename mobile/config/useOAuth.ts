import { useEffect } from "react";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

export function useGoogleAuth() {
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
      // profileImageSize: 150,
    });
  }, []);
}
