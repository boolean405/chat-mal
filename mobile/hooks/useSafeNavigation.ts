import { useRef } from "react";
import { useRouter } from "expo-router";

export function useSafeNavigation() {
  const router = useRouter();
  const isNavigatingRef = useRef(false);

  const safePush = (path: any) => {
    if (isNavigatingRef.current) return; // ignore if already navigating
    isNavigatingRef.current = true;
    router.push(path);

    // reset after small delay
    setTimeout(() => {
      isNavigatingRef.current = false;
    }, 500);
  };

  return { safePush };
}
