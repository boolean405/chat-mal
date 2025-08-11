import { create } from "zustand";
import { User } from "@/types";
import { getPaginatedFollowUsers } from "@/api/user";

type FollowType = "Followers" | "Following" | "Friends";
type SortType = "Online" | "A-Z" | "Z-A" | "Newest" | "Oldest";

interface FollowState {
  users: User[];
  page: number;
  keyword: string;
  totalPage: number;
  isLoading: boolean;
  hasMore: boolean;
  selectedType: FollowType;
  selectedSort: SortType;
  reset: () => void;
  exit: () => void;
  setKeyword: (keyword: string) => void;
  setSelectedSort: (sort: SortType) => void;
  setSelectedType: (type: FollowType) => void;
  fetchUsers: (isNextPage?: boolean) => Promise<void>;
}

export const useFollowStore = create<FollowState>((set, get) => ({
  users: [],
  page: 1,
  totalPage: 1,
  isLoading: false,
  hasMore: true,
  keyword: "",
  selectedType: "Friends",
  selectedSort: "Online",

  setKeyword: (keyword) => set({ keyword }),

  fetchUsers: async (isNextPage = false) => {
    const {
      page,
      selectedType,
      users,
      isLoading,
      selectedSort,
      keyword,
      totalPage,
    } = get();

    if (isLoading) return;

    const nextPage = isNextPage ? page + 1 : 1;

    set({ isLoading: true });

    try {
      const data = await getPaginatedFollowUsers({
        pageNum: nextPage,
        type: selectedType.toLowerCase(),
        sort: selectedSort.toLowerCase(),
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

  setSelectedSort: (sort) => set({ selectedSort: sort }),

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

  exit: () =>
    set({
      users: [],
      page: 1,
      keyword: "",
      hasMore: true,
      isLoading: false,
      selectedSort: "Online",
      selectedType: "Friends",
    }),
}));
