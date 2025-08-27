import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createOrOpen, edit } from "@/api/been-together";
import { toDate } from "@/utils/dates";
import { User } from "@/types";

interface BeenTogether {
  title?: string;
  partner?: User | null;
  lovedAt?: Date;
  eventsDayCount?: number;
}

interface BeenTogetherState {
  title: string;
  lovedAt: Date;
  partner: User | null;
  isLoading: boolean;
  eventsDayCount: number;

  fetchData: () => void;
  updateData: (data: BeenTogether) => void;
}

export const useBeenTogetherStore = create<BeenTogetherState>()(
  persist(
    (set, get) => ({
      title: "We have been together",
      partner: null,
      lovedAt: new Date(),
      eventsDayCount: 5,
      isLoading: false,

      fetchData: async () => {
        set({ isLoading: true });
        try {
          const data = await createOrOpen();
          set({
            title: data.result.title,
            partner: data.result.partner,
            lovedAt: toDate(data.result.lovedAt),
            eventsDayCount: data.result.eventsDayCount,
          });
        } catch (error) {
          console.log(error);
        } finally {
          set({ isLoading: false });
        }
      },

      updateData: async ({ title, partner, lovedAt, eventsDayCount }) => {
        set({ isLoading: true });

        const payload: any = {};

        if (title && title !== get().title) {
          payload.title = title;
        }
        if (eventsDayCount && eventsDayCount !== get().eventsDayCount) {
          payload.eventsDayCount = eventsDayCount;
        }
        if (lovedAt && lovedAt !== get().lovedAt) {
          payload.lovedAt = lovedAt;
        }

        // Partner
        if (partner === null) {
          payload.partner = null;
        } else if (partner?._id) {
          payload.partner = partner._id;
        }

        try {
          const data = await edit(payload);
          set({
            title: data.result.title,
            partner: data.result.partner,
            lovedAt: toDate(data.result.lovedAt),
            eventsDayCount: data.result.eventsDayCount,
          });
        } catch (error) {
          console.log(error);
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: "been-together",
      storage: createJSONStorage(() => AsyncStorage),

      // CRUCIAL: when rehydrating from AsyncStorage, coerce lovedAt back to a Date
      merge: (persisted, current) => {
        const s = { ...current, ...(persisted as any) };
        s.lovedAt = toDate(s.lovedAt);
        return s;
      },
    }
  )
);
