// MonoJot Design Tokens & Minimalist Theme Palette

export interface ThemeColors {
  bg: string;
  bgRaised: string;
  bgDeep: string;
  stroke: string;
  strokeDim: string;
  ink: string;
  inkMid: string;
  inkDim: string;
  accent: string;
  accentText: string;
  doneBtn: string;
  doneBtnText: string;
  shadow: string;
}

export const themes: { light: ThemeColors; dark: ThemeColors } = {
  light: {
    bg: '#F6F6F8',       // Warm off-white paper canvas
    bgRaised: '#FFFFFF', // Clean elevated squircle card
    bgDeep: '#EFEFF2',
    stroke: '#111113',
    strokeDim: '#E0E0E6', // Crisp razor-sharp vector line against warm canvas
    ink: '#111113',      // Pure charcoal/black
    inkMid: '#48484A',
    inkDim: '#8E8E93',
    accent: '#111113',
    accentText: '#FFFFFF',
    doneBtn: '#111113',
    doneBtnText: '#FFFFFF',
    shadow: 'transparent',
  },
  dark: {
    bg: '#000000',       // True pitch OLED black
    bgRaised: '#1C1C1E', // Apple-grade elevated dark card (contrast against pitch black)
    bgDeep: '#0A0A0C',
    stroke: '#FFFFFF',
    strokeDim: '#2C2C2E',
    ink: '#FFFFFF',      // Pure crisp white
    inkMid: '#AEAEB2',
    inkDim: '#636366',
    accent: '#FFFFFF',
    accentText: '#000000',
    doneBtn: '#FFFFFF',
    doneBtnText: '#000000',
    shadow: '#000000',
  }
};

export const sharedTokens = {
  radius: {
    pill: 9999,
    lg: 24,
    md: 16,
    sm: 10,
  },
  spacing: [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64] as const,
  shadow: {
    // Zero-elevation flat minimalist architecture — eliminates blurry Android shadow halos
    gentle: {},
    donePill: {},
  }
};

