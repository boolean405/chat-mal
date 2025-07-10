import { create } from "zustand";

interface UiState {
  timeTick: number;
  updateTick: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  timeTick: Date.now(),
  updateTick: () => set({ timeTick: Date.now() }),
}));
