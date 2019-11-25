interface Window {
  ResizeObserver: ResizeObserver;
}

interface ResizeObserver {
  // eslint-disable-next-line @typescript-eslint/no-misused-new
  new (callback: ResizeObserverCallback): ResizeObserver;

  observe: (target: Element) => void;
  unobserve: (target: Element) => void;
  disconnect: () => void;
}

interface ResizeObserverCallback {
  (entries: ResizeObserverEntry[], observer: ResizeObserver): void;
}

interface ResizeObserverEntry {
  // eslint-disable-next-line @typescript-eslint/no-misused-new
  new (target: Element): ResizeObserverEntry;

  readonly target: Element;
  readonly contentRect: DOMRectReadOnly;
}
