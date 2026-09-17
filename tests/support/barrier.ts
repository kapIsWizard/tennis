export function createBarrier(participants: number): () => Promise<void> {
  if (!Number.isInteger(participants) || participants < 1) {
    throw new RangeError('participants must be a positive integer');
  }

  let arrived = 0;
  let release: (() => void) | undefined;
  const ready = new Promise<void>(resolve => {
    release = resolve;
  });

  return async () => {
    arrived += 1;
    if (arrived === participants) {
      release?.();
    }
    await ready;
  };
}
