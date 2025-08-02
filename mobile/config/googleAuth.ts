import { useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import { loginGoogle } from "@/api/user";
import * as WebBrowser from "expo-web-browser";
import { makeRedirectUri, useAuthRequest } from "expo-auth-session";

WebBrowser.maybeCompleteAuthSession();

export function useGoogleAuth() {
  const GOOGLE_REDIRECT_URI =
    "http://127.0.0.1:3000/api/user/login-google-callback";

  const discovery = {
    authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenEndpoint: "https://oauth2.googleapis.com/token",
    revocationEndpoint: "https://oauth2.googleapis.com/revoke",
  };

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID!,
      redirectUri: makeRedirectUri({
        native: "chatmal://redirect",
      }),
      scopes: ["profile", "email", "openid"],
      responseType: "id_token",
    },
    discovery
  );

  useEffect(() => {
    console.log("response", response);

    if (response?.type === "success") {
      const { authentication } = response;
    }
  }, [response]);

  const handleLoginGoogle = async (idToken: string) => {
    try {
      console.log("Logging in with Google...");
      const data = await loginGoogle(idToken);

      console.log(data, "from server");

      // setUser(data.result.user, data.result.accessToken);
      console.log("Login success");
    } catch (err: any) {
      console.error("Backend login failed:", err.response?.data || err.message);
    }
  };

  return { request, promptAsync };
}
