export type DotType = 'circle' | 'line' | 'dither' | 'diamond';

export interface RisoInk {
  id: string;
  name: string;
  hex: string;
  pantone: string;
  family: 'warm' | 'cool' | 'neutral' | 'fluo' | 'special';
  description: string;
}

export interface PaperStock {
  id: string;
  name: string;
  hex: string;
  grainColor: string;
  warmth: number;
  description: string;
}

export interface DrumConfig {
  id: 1 | 2 | 3;
  inkId: string;
  angle: number; // in degrees (e.g. 15, 75, 45)
  screenFrequency: number; // 8 to 50
  dotType: DotType;
  offsetX: number; // -30 to 30 px
  offsetY: number; // -30 to 30 px
  rotation: number; // -3 to 3 deg
  threshold: number; // 0 to 100
  contrast: number; // 0 to 200%
  invert: boolean;
  opacity: number; // 50 to 100%
  visible: boolean;
}

export type ShapeType =
  | 'circle'
  | 'rectangle'
  | 'triangle'
  | 'star'
  | 'sunburst'
  | 'arch'
  | 'halftone-cluster'
  | 'wave'
  | 'stamp'
  | 'grid'
  | 'badge';

export interface CompositionItem {
  id: string;
  type: 'shape' | 'text';
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  width: number; // percentage
  height: number; // percentage
  rotation: number; // degrees
  zIndex: number;
  drum: 'drum1' | 'drum2' | 'drum3' | 'overprint';
  tint: number; // 10 to 100%
  // Text specific
  text?: string;
  fontFamily?: string;
  fontSize?: number; // scale
  fontWeight?: 'normal' | 'bold' | '800';
  letterSpacing?: number;
  textAlign?: 'left' | 'center' | 'right';
  // Shape specific
  shapeType?: ShapeType;
  filled?: boolean;
  strokeWidth?: number;
}

export type SeparationMethod = 'luminance-split' | 'spectral-cmy' | 'duotone' | 'posterize';

export type StudioMode = 'photo' | 'compose';

export type ViewMode = 'combined' | 'drum1' | 'drum2' | 'drum3' | 'masters';

export interface StudioState {
  mode: StudioMode;
  drumCount: 2 | 3;
  drums: [DrumConfig, DrumConfig, DrumConfig];
  paperStockId: string;
  paperGrain: number; // 0 to 100
  feedRollerMarks: boolean;
  registrationMarks: boolean;
  activeView: ViewMode;
  loupeActive: boolean;
  separationMethod: SeparationMethod;
  separationBalance: number; // 0 to 100
  // Photo mode props
  photoDataUrl: string | null;
  photoBrightness: number; // -50 to 50
  photoContrast: number; // 50 to 200
  photoInvert: boolean;
  // Compose mode items
  items: CompositionItem[];
  selectedItemId: string | null;
}
