import { Chat, User } from "@/types";
import { create } from "zustand";

interface CallData {
  chat: Chat;
  caller: User;
  callMode: "video" | "audio"; // Replace with your actual `User` type if available
  // currentChat: Chat; // Replace with your actual `Chat` type
}

interface CallStore {
  isCallActive: boolean;
  isMinimized: boolean;
  isMuted: boolean;
  isVideo: boolean;
  isRequestCall: boolean;
  isIncomingCall: boolean;
  isAcceptedCall: boolean;
  facing: "front" | "back";
  callData: CallData | null;
  remoteVideoStatus: Record<string, boolean>;
  remoteAudioStatus: Record<string, boolean>;
  remoteFacingStatus: Record<string, boolean>;

  setIsCallActive: (active: boolean) => void;
  setIsMinimized: (isMinimized: boolean) => void;
  setCallData: (callData: CallData | null) => void;
  setFacing: (facingMode: "front" | "back") => void;
  setIsMuted: (isMuted: boolean) => void;
  setIsVideo: (isVideo: boolean) => void;
  setRequestCall: (callData: CallData) => void;
  setIncomingCall: (callData: CallData) => void;
  setAcceptedCall: () => void;
  endCall: () => void;
  updateRemoteVideoStatus: (userId: string, isVideo: boolean) => void;
  updateRemoteAudioStatus: (userId: string, isMuted: boolean) => void;
  updateRemoteFacingStatus: (userId: string, isFaced: boolean) => void;
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
  isAcceptedCall: false,
  remoteVideoStatus: {},
  remoteAudioStatus: {},
  remoteFacingStatus: {},

  updateRemoteVideoStatus: (userId, isVideo) =>
    set((state) => ({
      remoteVideoStatus: {
        ...state.remoteVideoStatus,
        [userId]: isVideo,
      },
    })),

  updateRemoteAudioStatus: (userId, isMuted) =>
    set((state) => ({
      remoteAudioStatus: {
        ...state.remoteAudioStatus,
        [userId]: isMuted,
      },
    })),

  updateRemoteFacingStatus: (userId, isFaced) =>
    set((state) => ({
      remoteFacingStatus: {
        ...state.remoteFacingStatus,
        [userId]: isFaced,
      },
    })),

  setIsCallActive: (active) => set({ isCallActive: active }),
  setIsMuted: (isMuted) => set({ isMuted }),
  setIsVideo: (isVideo) => set({ isVideo }),
  setFacing: (facing) => set({ facing }),
  setIsMinimized: (isMinimized) => set({ isMinimized }),
  setCallData: (callData) => set({ callData: callData }),

  setAcceptedCall: () =>
    set({
      isCallActive: true,
      isAcceptedCall: true,
      isIncomingCall: false,
      isRequestCall: false,
      isMinimized: false,
    }),

  setRequestCall: (callData) =>
    set({
      isCallActive: true,
      isRequestCall: true,
      isIncomingCall: false,
      isAcceptedCall: false,
      isMinimized: false,
      callData,
      isVideo: callData.callMode === "video",
    }),

  setIncomingCall: (callData) =>
    set({
      isCallActive: true,
      isIncomingCall: true,
      isAcceptedCall: false,
      isMinimized: false,
      callData,
      isVideo: callData.callMode === "video",
    }),

  endCall: () =>
    set({
      callData: null,
      isCallActive: false,
      isMinimized: false,
      isIncomingCall: false,
      isAcceptedCall: false,
      isRequestCall: false,
      isMuted: false,
      isVideo: false,
      facing: "front",
      remoteVideoStatus: {},
      remoteAudioStatus: {},
      remoteFacingStatus: {},
    }),
}));
