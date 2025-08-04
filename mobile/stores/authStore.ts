import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "@/types";
import { router } from "expo-router";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  setUser: (user: User, accessToken: string) => void;
  setUserOnly: (user: User) => void;
  clearUser: () => void;
  checkAuth: () => boolean;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,

      setUser: (user, accessToken) => set({ user, accessToken: accessToken }),

      setUserOnly: (user: User) => {
        const { accessToken } = get();
        set({ user, accessToken }); // Keep accessToken unchanged
      },

      clearUser: () => {
        set({ user: null, accessToken: null });
      },

      checkAuth: () => {
        const { user, accessToken } = get();
        return !!user && !!accessToken;
      },

      logout: async () => {
        await AsyncStorage.removeItem("auth-storage");
        set({ user: null, accessToken: null });
        router.replace("/(auth)");
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
