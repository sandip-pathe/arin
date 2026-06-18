import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

export const defaultSettings = {
  summary: {
    length: "medium",
    complexity: "balanced",
    tone: "professional",
    style: "detailed",
    jurisdiction: "",
    response: "auto",
  },
  chat: {
    conversationStyle: "balanced",
    responseLength: "medium",
    autoSuggestions: true,
  },
};

export type AppSettings = typeof defaultSettings;

interface SettingsState {
  settings: AppSettings;
  updateSettings: (newSettings: {
    summary?: Partial<AppSettings["summary"]>;
    chat?: Partial<AppSettings["chat"]>;
  }) => void;
  resetSettings: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  devtools(
    persist(
      (set) => ({
        settings: defaultSettings,
        updateSettings: (newSettings) =>
          set((state) => ({
            settings: {
              summary: {
                ...state.settings.summary,
                ...newSettings.summary,
              },
              chat: {
                ...state.settings.chat,
                ...newSettings.chat,
              },
            },
          })),
        resetSettings: () => set({ settings: defaultSettings }),
      }),
      {
        name: "local-settings-storage",
      }
    )
  )
);
