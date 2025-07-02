import { create } from "zustand";
import {
  clearUserData,
  getAccessToken,
  getUserData,
  saveUserData,
} from "@/storage/authStorage";
import { User } from "@/types";

type UserStore = {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  setUser: (user: User | null, accessToken: string | null) => void;
  loadUser: () => Promise<void>;
  clearUser: () => void;
};

export const useAuthStore = create<UserStore>((set) => ({
  user: null,
  accessToken: null,
  isLoading: false,
  setUser: async (user, accessToken) => {
    set({ user, accessToken });
    if (user && accessToken) {
      await saveUserData(user, accessToken);
    } else {
      clearUserData(); // optional: clear if null is passed
    }
  },
  loadUser: async () => {
    const user = await getUserData();
    const accessToken = await getAccessToken();
    set({ user, accessToken });
  },
  clearUser: async () => {
    await clearUserData();
    set({ user: null });
  },
}));
