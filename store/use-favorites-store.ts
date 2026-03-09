import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import zustandMMKVStorage from "@/lib/zustand-mmkv";
import { TFacilityProfileOutput } from "@/schemas/facility-profile.schema";

interface FavoritesState {
  favorites: TFacilityProfileOutput[];
  addFavorite: (facility: TFacilityProfileOutput) => void;
  removeFavorite: (facilityId: string) => void;
  setFavorites: (facilities: TFacilityProfileOutput[]) => void;
  isFavorite: (facilityId: string) => boolean;
}

const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      addFavorite: (facility) => {
        const { favorites } = get();
        if (!favorites.some((f) => f.id === facility.id)) {
          set({ favorites: [...favorites, facility] });
        }
      },
      removeFavorite: (facilityId) => {
        const { favorites } = get();
        set({ favorites: favorites.filter((f) => f.id !== facilityId) });
      },
      setFavorites: (facilities) => set({ favorites: facilities }),
      isFavorite: (facilityId) => {
        const { favorites } = get();
        return favorites.some((f) => f.id === facilityId);
      },
    }),
    {
      name: "favorites-storage",
      storage: createJSONStorage(() => zustandMMKVStorage),
    }
  )
);

export default useFavoritesStore;
