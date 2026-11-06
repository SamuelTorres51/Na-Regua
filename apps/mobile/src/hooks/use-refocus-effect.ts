import { useFocusEffect } from "expo-router";
import { useCallback, useRef } from "react";

export function useRefocusEffect(effect: () => void) {
  const focusCountRef = useRef(0);

  useFocusEffect(
    useCallback(() => {
      focusCountRef.current += 1;

      if (focusCountRef.current > 1) {
        effect();
      }
    }, [effect])
  );
}
