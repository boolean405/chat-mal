// stores/useNetworkStore.ts
import { create } from "zustand";
import type { NetInfoState } from "@react-native-community/netinfo";

interface NetworkState {
  networkInfo: NetInfoState | null;
  setNetworkInfo: (networkInfo: NetInfoState | null) => void;
}

export const useNetworkStore = create<NetworkState>((set) => ({
  networkInfo: null,
  setNetworkInfo: (networkInfo) => set({ networkInfo }),
}));
