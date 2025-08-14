import { useEffect, useState } from "react";
import { AppState, AppStateStatus } from "react-native";

/**
 * useAppState
 * A reusable hook to track whether the app is active, background, or inactive.
 */
export default function useAppState() {
  const [appState, setAppState] = useState<AppStateStatus>(
    AppState.currentState
  );

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      setAppState(nextState);
    });

    return () => subscription.remove();
  }, []);

  return appState; // "active" | "background" | "inactive"
}
