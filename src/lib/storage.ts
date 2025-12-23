import * as SecureStore from "expo-secure-store";

export const STORAGE_KEYS = {
  settings: "emoiq_settings",
  progress: "emoiq_progress",
  entitlements: "emoiq_entitlements",
} as const;

export async function readJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await SecureStore.getItemAsync(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function writeJson<T>(key: string, value: T): Promise<void> {
  try {
    await SecureStore.setItemAsync(key, JSON.stringify(value));
  } catch {
    // Intentionally noop: local-first storage should not crash the UI.
  }
}
