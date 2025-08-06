import { create } from "zustand";
import { getPaginateUsers } from "@/api/user";
import { User } from "@/types";

interface UserSearchState {
  results: User[];
  page: number;
  hasMore: boolean;
  isLoading: boolean;
  isPaging: boolean;
  errorMessage: string;
  selectedFilter: string;
  keyword: string;

  setKeyword: (keyword: string) => void;
  setSelectedFilter: (filter: string) => void;
  resetSearch: () => void;

  fetchSearchUsers: (isPaging?: boolean) => Promise<void>;
}

export const useUsersSearchStore = create<UserSearchState>((set, get) => ({
  results: [],
  page: 1,
  hasMore: true,
  isLoading: false,
  isPaging: false,
  errorMessage: "",
  selectedFilter: "All",
  keyword: "",

  setKeyword: (keyword) => set({ keyword }),
  setSelectedFilter: (filter) =>
    set({ selectedFilter: filter, page: 1, results: [] }),

  resetSearch: () =>
    set({
      results: [],
      page: 1,
      hasMore: true,
      isLoading: false,
      isPaging: false,
      errorMessage: "",
      selectedFilter: "All",
      keyword: "",
    }),

  fetchSearchUsers: async (isPaging = false) => {
    const { page, keyword, selectedFilter, results } = get();
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

      const data = await getPaginateUsers(nextPage, keyword, gender);

      const newResults = data.result.users;

      const updatedResults = isPaging
        ? Array.from(
            new Map([...results, ...newResults].map((u) => [u._id, u])).values()
          )
        : newResults;

      set({
        results: updatedResults,
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
}));
