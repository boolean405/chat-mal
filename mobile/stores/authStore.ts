import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

type User = {
  id: string;
  name: string;
  email: string;
};

type UserState = {
  user: User | null;
  accessToken: string | null;
  setUser: (user: User, accessToken: string) => void;
  clearUser: () => void;
};

export const useAuthStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,

      setUser: (user, accessToken) => {
        set({ user, accessToken });
      },

      clearUser: () => {
        set({ user: null, accessToken: null });
      },
    }),
    {
      name: "user-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
