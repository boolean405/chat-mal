import { useEffect } from "react";
import { makeRedirectUri } from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";
import { useAuthStore } from "@/stores/authStore";
import { loginGoogle } from "@/api/user";

export function useGoogleAuth() {
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID!,
    scopes: ["profile", "email"],

    redirectUri: makeRedirectUri({
      native: "chatmal:/oauth2redirect/google",
    }),
  });

  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    if (response?.type === "success") {
      const idToken = response.authentication?.idToken;
      if (!idToken) return;

      handleLoginGoogle(idToken);
    }
  }, [response]);

  const handleLoginGoogle = async (idToken: string) => {
    try {
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
