import { Chat, User } from "@/types";
import { create } from "zustand";

interface CallData {
  chatId: string;
  user: User; // Replace with your actual `User` type if available
  currentChat: Chat; // Replace with your actual `Chat` type
}

interface CallStore {
  isCallActive: boolean;
  isMinimized: boolean;
  isMuted: boolean;
  isVideo: boolean;
  facing: "front" | "back";
  callData: CallData | null;

  setIsCallActive: (active: boolean) => void;
  setIsMinimized: (isMinimized: boolean) => void;
  setCallData: (data: CallData | null) => void;
  setFacing: (facingMode: "front" | "back") => void;
  setIsMuted: (isMuted: boolean) => void;
  setIsVideo: (isVideo: boolean) => void;
}

export const useCallStore = create<CallStore>((set) => ({
  isCallActive: false,
  isMinimized: false,
  isMuted: false,
  isVideo: false,
  facing: "front",
  callData: null,

  setIsCallActive: (active) => set({ isCallActive: active }),
  setIsMuted: (isMuted) => set({ isMuted }),
  setIsVideo: (isVideo) => set({ isVideo }),
  setFacing: (facing) => set({ facing }),
  setIsMinimized: (isMinimized) => set({ isMinimized }),
  setCallData: (data) => set({ callData: data }),
}));
