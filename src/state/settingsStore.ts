import { create } from "zustand";

import { readJson, STORAGE_KEYS, writeJson } from "@/lib/storage";

export type ThemePreference = "light" | "dark" | "system";

type SettingsState = {
  theme: ThemePreference;
  highContrast: boolean;
  reduceMotion: boolean;
  hydrated: boolean;
  setTheme: (value: ThemePreference) => void;
  setHighContrast: (value: boolean) => void;
  setReduceMotion: (value: boolean) => void;
  hydrate: () => Promise<void>;
};

const defaultState = {
  theme: "dark" as ThemePreference,
  highContrast: false,
  reduceMotion: false,
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  ...defaultState,
  hydrated: false,
  setTheme: (value) => {
    set({ theme: value });
    writeJson(STORAGE_KEYS.settings, { ...get(), theme: value });
  },
  setHighContrast: (value) => {
    set({ highContrast: value });
    writeJson(STORAGE_KEYS.settings, { ...get(), highContrast: value });
  },
  setReduceMotion: (value) => {
    set({ reduceMotion: value });
    writeJson(STORAGE_KEYS.settings, { ...get(), reduceMotion: value });
  },
  hydrate: async () => {
    const stored = await readJson(STORAGE_KEYS.settings, defaultState);
    set({ ...stored, hydrated: true });
  },
}));
