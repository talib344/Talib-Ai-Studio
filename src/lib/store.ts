import { create } from "zustand";

type Theme = "dark" | "light";
type Language = "English" | "Arabic" | "Spanish" | "French" | "Hindi";

interface SettingsState {
  theme: Theme;
  language: Language;
  storageLocation: string;
  outputDirectory: string;
  setTheme: (t: Theme) => void;
  setLanguage: (l: Language) => void;
  setField: <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  theme: "dark",
  language: "English",
  storageLocation: "/talib/storage",
  outputDirectory: "/talib/exports",
  setTheme: (theme) => set({ theme }),
  setLanguage: (language) => set({ language }),
  setField: (key, value) => set({ [key]: value } as Partial<SettingsState>),
}));
