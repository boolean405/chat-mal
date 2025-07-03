import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "@/types";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  setUser: (user: User, accessToken: string) => void;
  clearUser: () => void;
  checkAuth: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,

      setUser: (user, accessToken) => set({ user, accessToken: accessToken }),

      clearUser: () => {
        set({ user: null, accessToken: null });
      },

      checkAuth: () => {
        const { user, accessToken } = get();
        return !!user && !!accessToken;
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
