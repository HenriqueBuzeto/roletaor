export interface Prize {
  id: string;
  name: string;
  active: boolean;
  probability?: number; // Porcentagem customizada de chance (0.1 a 100). Se não definido, calcula uniforme.
  color?: string; // Optional custom color override if ever needed
  createdAt: number;
}

export type WheelStatus = "idle" | "spinning" | "celebrating";

export interface WheelSegmentGeometry {
  index: number;
  prize: Prize;
  startAngle: number; // in degrees [0, 360)
  endAngle: number;   // in degrees [0, 360)
  centerAngle: number;// middle angle of the wedge
  pathD: string;      // SVG path definition
  textAngle: number;  // Rotation for the text label
  textRadius: number; // Radial offset for text placement
  color: string;      // Segment fill color
}

export interface WheelSettings {
  spinDuration: number; // in seconds (e.g. 4 to 10s, default: 7s)
  soundEnabled: boolean;
  confettiEnabled: boolean;
  presentationMode: boolean;
  fullScreen: boolean;
  orientationRotation: 0 | 90 | 180 | 270; // Rotação da tela em graus para monitores verticais/horizontais
}

export interface SpinResult {
  id: string;
  prizeId: string;
  prizeName: string;
  timestamp: number;
}
