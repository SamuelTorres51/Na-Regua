const FAKE_LATENCY_MS = 900;

export function simulateLatency(ms = FAKE_LATENCY_MS) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}
