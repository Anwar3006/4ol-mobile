import zustandMMKVStorage from "@/lib/zustand-mmkv";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type FacilityStore = {
  topFacilities: any[];
  setTopFacilities: (facilities: any[]) => void;
  lastUpdated: number;
};

const useFacilityStore = create<FacilityStore>()(
  persist(
    (set) => ({
      topFacilities: [],
      lastUpdated: 0,
      setTopFacilities: (facilities) =>
        set({
          topFacilities: facilities,
          lastUpdated: Date.now(),
        }),
    }),
    {
      name: "facility-storage",
      storage: createJSONStorage(() => zustandMMKVStorage),
    }
  )
);

export default useFacilityStore;
