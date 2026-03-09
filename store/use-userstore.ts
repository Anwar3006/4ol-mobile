import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import zustandMMKVStorage from "@/lib/zustand-mmkv";
import { UserStore } from "@/types";

interface UserState extends UserStore {
  hasAcknowledgedDisclaimer: boolean;
  setHasAcknowledgedDisclaimer: (val: boolean) => void;
}

const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      logoutUser: () => set({ user: null }),
      hasAcknowledgedDisclaimer: false,
      setHasAcknowledgedDisclaimer: (val) =>
        set({ hasAcknowledgedDisclaimer: val }),
    }),
    {
      name: "user-storage",
      storage: createJSONStorage(() => zustandMMKVStorage),
    }
  )
);

export default useUserStore;
