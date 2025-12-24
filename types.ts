
export enum TreeState {
  CHAOS = 'CHAOS',
  FORMED = 'FORMED'
}

export interface OrnamentData {
  chaosPosition: [number, number, number];
  targetPosition: [number, number, number];
  color: string;
  weight: number; // For lerp timing
  scale: number;
  type: 'ball' | 'box' | 'light' | 'polaroid';
  textureUrl?: string;
}

export interface GestureState {
  isOpen: boolean;
  handPosition: { x: number; y: number };
}
