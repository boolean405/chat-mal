import { create } from "zustand";

import { Chat } from "@/types";
import { getPaginateGroupChats } from "@/api/chat";

type selectedType = "My groups" | "Recommend" | "Explore";
type selectedSort = "A-Z" | "New" | "Popular" | "Z-A" | "Active";

interface GroupChatStore {
  groups: Chat[];
  page: number;
  keyword: string;
  hasMore: boolean;
  isLoading: boolean;
  selectedType: selectedType;
  selectedSort: selectedSort;

  exit: () => void;
  reset: () => void;
  loadMore: () => Promise<void>;
  setKeyword: (keyword: string) => void;
  fetchGroups: (reset?: boolean) => Promise<void>;
  setSelectedType: (selectedType: selectedType) => void;
  setSelectedSort: (selectedSort: selectedSort) => void;
}

export const useGroupChatStore = create<GroupChatStore>((set, get) => ({
  groups: [],
  page: 1,
  hasMore: true,
  isLoading: false,
  keyword: "",
  selectedType: "My groups",
  selectedSort: "Active",

  setKeyword: (keyword) => set({ keyword }),
  setSelectedType: (selectedType) => set({ selectedType }),
  setSelectedSort: (selectedSort) => set({ selectedSort }),

  exit: () =>
    set({
      groups: [],
      page: 1,
      keyword: "",
      hasMore: true,
      isLoading: false,
      selectedSort: "Active",
      selectedType: "My groups",
    }),

  reset: () => set({ groups: [], page: 1, hasMore: true }),

  fetchGroups: async (reset = false) => {
    if (get().isLoading) return;

    set({ isLoading: true });

    try {
      const { page, selectedType, keyword, groups, selectedSort } = get();
      const fetchPage = reset ? 1 : page;

      const typeMap = {
        "My groups": "my",
        Recommend: "recommend",
        Explore: "all",
      };
      const type = typeMap[selectedType] || "all";
      console.log(selectedSort);

      // Pass selectedSort as sort param to your API
      const data = await getPaginateGroupChats({
        type,
        pageNum: fetchPage,
        keyword,
        sort: selectedSort.toLowerCase(), // example: "a-z" or "new" etc.
      });

      // Deduplicate groups by _id when merging
      const newGroups = data.result.groupChats;
      const mergedGroups = reset
        ? newGroups
        : [
            ...groups,
            ...newGroups.filter(
              (g: Chat) => !groups.some((existing) => existing._id === g._id)
            ),
          ];

      set({
        groups: mergedGroups,
        page: fetchPage,
        hasMore: fetchPage < data.result.totalPage,
      });
    } catch (err: any) {
      alert(err.message);
    } finally {
      set({ isLoading: false });
    }
  },

  loadMore: async () => {
    if (get().hasMore && !get().isLoading) {
      await get().fetchGroups(false);
      set((state) => ({ page: state.page + 1 }));
    }
  },
}));
