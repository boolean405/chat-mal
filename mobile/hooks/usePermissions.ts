import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, AppStateStatus, Linking, Platform } from "react-native";
import {
  PermissionResponse,
  PermissionStatus,
  useCameraPermissions,
  useMicrophonePermissions,
} from "expo-camera";

/**
 * Handles camera & microphone permissions:
 * - Requests on first run
 * - Re-requests when allowed to
 * - Directs to Settings when blocked
 * - Refreshes when app returns from background
 */
export const usePermissions = () => {
  // Note: some versions return [perm, request, get]; examples show 2-tuple.
  const [cameraPerm, requestCamera, getCamera] = useCameraPermissions();
  const [micPerm, requestMic, getMic] = useMicrophonePermissions();

  const [blocked, setBlocked] = useState({ camera: false, mic: false });
  const appState = useRef<AppStateStatus>(AppState.currentState);

  const refresh = useCallback(async () => {
    // Prefer get* if available; fall back to request* (no-op if blocked).
    const cam = (await (getCamera?.() ??
      requestCamera())) as PermissionResponse;
    const mic = (await (getMic?.() ?? requestMic())) as PermissionResponse;

    setBlocked({
      camera:
        cam.status === PermissionStatus.DENIED && cam.canAskAgain === false,
      mic: mic.status === PermissionStatus.DENIED && mic.canAskAgain === false,
    });
  }, [getCamera, requestCamera, getMic, requestMic]);

  const ensureGranted = useCallback(async () => {
    if (
      cameraPerm?.status !== PermissionStatus.GRANTED &&
      cameraPerm?.canAskAgain
    ) {
      await requestCamera();
    }
    if (micPerm?.status !== PermissionStatus.GRANTED && micPerm?.canAskAgain) {
      await requestMic();
    }
  }, [cameraPerm, micPerm, requestCamera, requestMic]);

  // First mount: get current status, then request if we can.
  useEffect(() => {
    (async () => {
      await refresh();
      await ensureGranted();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When returning from Settings, refresh states.
  useEffect(() => {
    const sub = AppState.addEventListener("change", async (next) => {
      if (appState.current.match(/inactive|background/) && next === "active") {
        await refresh();
      }
      appState.current = next;
    });
    return () => sub.remove();
  }, [refresh]);

  const openSettingsIfBlocked = useCallback(async () => {
    if (Platform.OS === "ios" || Platform.OS === "android") {
      await Linking.openSettings();
    }
  }, []);

  return {
    camera: cameraPerm, // PermissionResponse | null
    microphone: micPerm, // PermissionResponse | null
    requestAll: ensureGranted, // Call to ask again (if canAskAgain)
    openSettingsIfBlocked, // Call to jump to Settings
    blocked, // { camera: boolean, mic: boolean }
    refresh, // Manually re-fetch permission status
  };
};
