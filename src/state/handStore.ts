export interface HandData {
  isPlaying: boolean;
  hands: any[];
  pinchStrength: number;
  pinchPosition: { x: number; y: number; z: number } | null;
  isPinching: boolean;
  isExploded: boolean;
  // Multi-hand metrics
  handDistance: number;
  handCenter: { x: number; y: number; z: number } | null;
  isTwoHandMode: boolean;
  rawKeypoints: any[] | null;
}

class HandStore {
  private data: HandData = {
    isPlaying: false,
    hands: [],
    pinchStrength: 0,
    pinchPosition: null,
    isPinching: false,
    isExploded: false,
    handDistance: 0,
    handCenter: null,
    isTwoHandMode: false,
    rawKeypoints: [],
  };

  private listeners: Set<(data: HandData) => void> = new Set();

  update(newData: Partial<HandData>) {
    this.data = { ...this.data, ...newData };
    this.listeners.forEach((listener) => listener(this.data));
  }

  getData() {
    return this.data;
  }

  subscribe(listener: (data: HandData) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}

export const handStore = new HandStore();
