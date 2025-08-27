import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Event } from "@/types";
import { createEvent, getPaginatedEvents } from "@/api/event";

interface EventState {
  events: Event[];
  page: number;
  keyword: string;
  sort: "upcoming" | "ended";
  isLoading: boolean;
  isPaging: boolean;
  errorMessage: string;
  hasMore: boolean;
  withinDays?: number;

  setSort: (sort: "upcoming" | "ended") => void;
  setWithinDays: (withinDays: number) => void;
  setKeyword: (keyword: string) => void;

  createEvent: (event: {
    title: string;
    description?: string;
    startAt: Date;
  }) => void;

  fetchEvents: (isPaging?: boolean) => Promise<void>;
  clearAllEvents: () => void;
}

export const useEventStore = create<EventState>()(
  persist(
    (set, get) => ({
      events: [],
      page: 1,
      keyword: "",
      sort: "upcoming",
      isLoading: false,
      isPaging: false,
      errorMessage: "",
      hasMore: true,
      withinDays: 0,

      setSort: (sort) => set({ sort }),
      setKeyword: (keyword) => set({ keyword }),
      setWithinDays: (withinDays) => set({ withinDays }),

      createEvent: async (event) => {
        try {
          const data = await createEvent(event);
          const newEvent = data.result.event;

          set((state) => {
            // merge the new event with existing ones
            const merged = [...state.events, newEvent];

            // sort ascending by startAt
            merged.sort(
              (a, b) =>
                new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
            );

            return { events: merged };
          });
        } catch (error: any) {
          console.log(error);
        }
      },

      fetchEvents: async (isPaging = false) => {
        const { page, keyword, events, sort, withinDays } = get();
        const nextPage = isPaging ? page + 1 : 1;
        try {
          set({
            isLoading: !isPaging,
            isPaging,
            errorMessage: "",
          });

          const data = await getPaginatedEvents({
            pageNum: nextPage,
            keyword,
            sort,
            withinDays,
          });

          const newResults = data.result.events;

          const updatedResults = isPaging
            ? Array.from(
                new Map(
                  [...events, ...newResults].map((e) => [e._id, e])
                ).values()
              )
            : newResults;

          set({
            events: updatedResults,
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

      clearAllEvents: () => set({ events: [] }),
    }),
    {
      name: "event",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        events: state.events,
      }),
    }
  )
);
