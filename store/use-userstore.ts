import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import zustandMMKVStorage from '@/lib/zustand-mmkv';
import {UserStore} from '@/types';

interface UserState extends UserStore {
  hasAcknowledgedDisclaimer: boolean;
  setHasAcknowledgedDisclaimer: (val: boolean) => void;
  hasSeenOnboarding: boolean;
  setHasSeenOnboarding: (val: boolean) => void;
  _hasHydrated: boolean;
  setHasHydrated: (val: boolean) => void;
}

const useUserStore = create<UserState>()(
  persist(
    set => ({
      _hasHydrated: false, // Add this
      setHasHydrated: (val: boolean) => set({ _hasHydrated: val }),
      user: null,
      setUser: user => set({user}),
      logoutUser: () => set({user: null, hasSeenOnboarding: false}),
      hasAcknowledgedDisclaimer: false,
      setHasAcknowledgedDisclaimer: val =>
        set({hasAcknowledgedDisclaimer: val}),
      hasSeenOnboarding: false,
      setHasSeenOnboarding: val => set({hasSeenOnboarding: val}),
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => zustandMMKVStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true); // Set to true when disk read is done
      },
    },
  ),
);

export default useUserStore;
