import { create } from "zustand";
import { getPaginateUsers } from "@/api/user";
import { User } from "@/types";

interface UserSearchState {
  users: User[];
  page: number;
  hasMore: boolean;
  isLoading: boolean;
  isPaging: boolean;
  errorMessage: string;
  selectedFilter: string;
  keyword: string;
  selectedSort: string;

  exit: () => void;
  setSelectedSort: (sort: string) => void;
  setKeyword: (keyword: string) => void;
  setSelectedFilter: (filter: string) => void;
  resetSearch: () => void;

  fetchSearchUsers: (isPaging?: boolean) => Promise<void>;
}

export const useUsersSearchStore = create<UserSearchState>((set, get) => ({
  users: [],
  page: 1,
  hasMore: true,
  isLoading: false,
  isPaging: false,
  errorMessage: "",
  selectedFilter: "All",
  keyword: "",
  selectedSort: "Online",

  setSelectedSort: (sort) => set({ selectedSort: sort }),

  setKeyword: (keyword) => set({ keyword }),
  setSelectedFilter: (filter) =>
    set({ selectedFilter: filter, page: 1, users: [] }),

  resetSearch: () =>
    set({
      users: [],
      page: 1,
      hasMore: true,
      isLoading: false,
      isPaging: false,
      errorMessage: "",
      selectedFilter: "All",
      keyword: "",
      selectedSort: "Online",
    }),

  fetchSearchUsers: async (isPaging = false) => {
    const { page, keyword, selectedFilter, users, selectedSort } = get();
    let gender = "";

    switch (selectedFilter) {
      case "Male":
        gender = "male";
        break;
      case "Female":
        gender = "female";
        break;
    }

    const nextPage = isPaging ? page + 1 : 1;

    try {
      set({
        isLoading: !isPaging,
        isPaging,
        errorMessage: "",
      });

      const data = await getPaginateUsers({
        PageNum: nextPage,
        keyword,
        gender,
        sort: selectedSort.toLocaleLowerCase(),
      });

      const newResults = data.result.users;

      const updatedResults = isPaging
        ? Array.from(
            new Map([...users, ...newResults].map((u) => [u._id, u])).values()
          )
        : newResults;

      set({
        users: updatedResults,
        page: nextPage,
        hasMore: nextPage < data.result.totalPage,
      });
    } catch (err: any) {
      set({
        errorMessage: err.message,
      });
    } finally {
      set({ isLoading: false, isPaging: false });
    }
  },

  exit: () =>
    set({
      users: [],
      page: 1,
      keyword: "",
      hasMore: true,
      isLoading: false,
      selectedSort: "Online",
    }),
}));
