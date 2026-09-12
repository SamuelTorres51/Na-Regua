import { useEffect, useState } from "react";

export function useRotatingIndex(length: number, intervalMs: number) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((current) => (current + 1) % length);
    }, intervalMs);

    return () => clearInterval(id);
  }, [intervalMs, length]);

  return index;
}
