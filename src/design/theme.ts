import { useColorScheme } from "react-native";

import { palette } from "./tokens";
import { useSettingsStore } from "@/state/settingsStore";

export type ThemeMode = "light" | "dark";

export const useThemeMode = (forced?: ThemeMode) => {
  const system = useColorScheme() === "dark" ? "dark" : "light";
  const mode = forced ?? system;
  return { mode, colors: palette[mode] };
};

export const useTheme = () => {
  const themePref = useSettingsStore((state) => state.theme);
  const highContrast = useSettingsStore((state) => state.highContrast);
  const forced = themePref === "system" ? undefined : themePref;
  const { mode, colors } = useThemeMode(forced);
  if (!highContrast) {
    return { mode, colors };
  }
  const contrast = {
    ...colors,
    textMain: mode === "dark" ? "#ffffff" : "#0b0b0d",
    textMuted: mode === "dark" ? "#e2e8f0" : "#334155",
    border: mode === "dark" ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.2)",
  };
  return { mode, colors: contrast };
};
