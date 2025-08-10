import { create } from "zustand";
import { User } from "@/types";
import { getPaginatedFollowUsers } from "@/api/user";

type FollowType = "Followers" | "Following" | "Friends";

interface FollowState {
  users: User[];
  page: number;
  totalPage: number;
  isLoading: boolean;
  hasMore: boolean;
  selectedType: FollowType;
  fetchUsers: (isNextPage?: boolean, keyword?: string) => Promise<void>;
  setSelectedType: (type: FollowType) => void;
  reset: () => void;
}

export const useFollowStore = create<FollowState>((set, get) => ({
  users: [],
  page: 1,
  totalPage: 1,
  isLoading: false,
  hasMore: true,
  selectedType: "Friends",

  fetchUsers: async (isNextPage = false, keyword = "") => {
    const { page, selectedType, users, isLoading, totalPage } = get();

    if (isLoading) return;

    const nextPage = isNextPage ? page + 1 : 1;

    set({ isLoading: true });

    try {
      const data = await getPaginatedFollowUsers({
        pageNum: nextPage,
        type: selectedType.toLowerCase(),
        keyword,
      });

      let newUsers: User[];

      if (isNextPage) {
        // append new page
        newUsers = [...users, ...data.result.users];
      } else {
        // replace only when we have the new data
        newUsers = data.result.users;
      }

      set({
        users: newUsers,
        page: nextPage,
        totalPage: data.result.totalPage,
        hasMore: nextPage < data.result.totalPage,
      });
    } catch (error) {
      console.log("Failed to load users:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  setSelectedType: (type) => {
    set({
      selectedType: type,
      users: [],
      page: 1,
      totalPage: 1,
      hasMore: true,
    });
  },

  reset: () => {
    set({
      users: [],
      page: 1,
      totalPage: 1,
      hasMore: true,
    });
  },
}));
