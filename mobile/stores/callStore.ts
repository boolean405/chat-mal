import { Chat, User } from "@/types";
import { create } from "zustand";

interface CallData {
  chat: Chat;
  caller: User;
  callMode: "video" | "voice"; // Replace with your actual `User` type if available
  // currentChat: Chat; // Replace with your actual `Chat` type
}

interface CallStore {
  isCallActive: boolean;
  isMinimized: boolean;
  isMuted: boolean;
  isVideo: boolean;
  isRequestCall: boolean;
  isIncomingCall: boolean;
  isAcceptCall: boolean;
  facing: "front" | "back";
  callData: CallData | null;

  setIsCallActive: (active: boolean) => void;
  setIsMinimized: (isMinimized: boolean) => void;
  setCallData: (callData: CallData | null) => void;
  setFacing: (facingMode: "front" | "back") => void;
  setIsMuted: (isMuted: boolean) => void;
  setIsVideo: (isVideo: boolean) => void;
  setRequestCall: (callData: CallData) => void;
  setIncomingCall: (callData: CallData) => void;
  setAcceptCall: () => void;
  endCall: () => void;
}

export const useCallStore = create<CallStore>((set) => ({
  isCallActive: false,
  isMinimized: false,
  isMuted: false,
  isVideo: false,
  facing: "front",
  callData: null,
  isRequestCall: false,
  isIncomingCall: false,
  isAcceptCall: false,

  setIsCallActive: (active) => set({ isCallActive: active }),
  setIsMuted: (isMuted) => set({ isMuted }),
  setIsVideo: (isVideo) => set({ isVideo }),
  setFacing: (facing) => set({ facing }),
  setIsMinimized: (isMinimized) => set({ isMinimized }),
  setCallData: (callData) => set({ callData: callData }),

  setAcceptCall: () =>
    set({
      isCallActive: true,
      isAcceptCall: true,
      isIncomingCall: false,
      isMinimized: false,
    }),

  setRequestCall: (callData) =>
    set({
      isCallActive: true,
      isRequestCall: true,
      callData,
      isVideo: callData.callMode === "video",
    }),

  setIncomingCall: (callData) =>
    set({
      isCallActive: true,
      isIncomingCall: true,
      callData,
      isVideo: callData.callMode === "video",
    }),

  endCall: () =>
    set({
      callData: null,
      isCallActive: false,
      isMinimized: false,
      isIncomingCall: false,
      isAcceptCall: false,
    }),
}));
