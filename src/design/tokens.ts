export const palette = {
  dark: {
    background: "#050914",
    surface: "#0f1623",
    card: "#131C2E",
    border: "#1e293b",
    textMain: "#f8fafc",
    textMuted: "#94a3b8",
    accent: "#38bdf8",
    accentDim: "#0ea5e9",
    accentGlow: "rgba(56, 189, 248, 0.4)",
    success: "#10b981",
    warning: "#f59e0b",
    cyan: "#06b6d4",
    cyanGlow: "#22d3ee",
  },
  light: {
    background: "#f8fafc",
    surface: "#ffffff",
    card: "#ffffff",
    border: "#e2e8f0",
    textMain: "#0f172a",
    textMuted: "#64748b",
    accent: "#0ea5e9",
    accentDim: "#0284c7",
    accentGlow: "rgba(14, 165, 233, 0.35)",
    success: "#10b981",
    warning: "#f59e0b",
    cyan: "#06b6d4",
    cyanGlow: "#22d3ee",
  },
} as const;

export const radii = {
  rSm: 8,
  rMd: 12,
  rLg: 16,
  rXl: 20,
  r2xl: 24,
  r3xl: 32,
} as const;

export const shadows = {
  glowSm: {
    shadowColor: palette.dark.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 2,
  },
  glowMd: {
    shadowColor: palette.dark.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 4,
  },
  cardDepth: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.6,
    shadowRadius: 28,
    elevation: 10,
  },
  inner: {
    shadowColor: "#ffffff",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 0,
    elevation: 0,
  },
} as const;

export const typography = {
  fonts: {
    display: "SpaceGrotesk_600SemiBold",
    displayBold: "SpaceGrotesk_700Bold",
    body: "Inter_400Regular",
    bodyMedium: "Inter_500Medium",
    bodySemi: "Inter_600SemiBold",
  },
  sizes: {
    h1: 34,
    h2: 28,
    h3: 22,
    title: 18,
    body: 15,
    bodySm: 13,
    label: 11,
    micro: 9,
  },
  letterSpacing: {
    wide: 2.5,
    wider: 4,
    ultra: 5,
  },
} as const;

export const tokens = {
  palette,
  radii,
  shadows,
  typography,
};
