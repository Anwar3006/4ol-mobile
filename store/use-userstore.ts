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
      _hasHydrated: false,
      setHasHydrated: (val: boolean) => set({ _hasHydrated: val }),
      user: null,
      setUser: user => set({user}),
      // NOTE: logoutUser intentionally does NOT reset hasSeenOnboarding.
      // hasSeenOnboarding is a one-way "first-launch" flag — once the user has
      // seen GetStarted they should never be redirected there again, even after
      // logout. Resetting it here caused the AuthProvider guard to redirect
      // back to GetStarted immediately after every login.
      logoutUser: () => set({user: null}),
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
        state?.setHasHydrated(true);
      },
    },
  ),
);

export default useUserStore;
