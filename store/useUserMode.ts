import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import zustandMMKVStorage from "@/lib/zustand-mmkv";

export type UserMode = "user" | "business";

interface UserModeState {
  currentMode: UserMode;
  setMode: (mode: UserMode) => void;
  toggleMode: () => void;
}

export const useUserMode = create<UserModeState>()(
  persist(
    (set) => ({
      currentMode: "user",
      setMode: (mode) => set({ currentMode: mode }),
      toggleMode: () =>
        set((state) => ({
          currentMode: state.currentMode === "user" ? "business" : "user",
        })),
    }),
    {
      name: "user-mode-storage",
      storage: createJSONStorage(() => zustandMMKVStorage),
    }
  )
);
