// hooks/useNetworkListener.ts
import { useEffect } from "react";
import NetInfo from "@react-native-community/netinfo";
import { useNetworkStore } from "@/stores/useNetworkStore";

export const useNetworkListener = () => {
  const setNetworkInfo = useNetworkStore((state) => state.setNetworkInfo);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setNetworkInfo(state ?? null);
    });

    return () => unsubscribe();
  }, [setNetworkInfo]);
};
