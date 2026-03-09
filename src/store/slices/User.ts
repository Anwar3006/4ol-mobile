import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type userType = {
  user: Record<string, any>;
  saveimageUrl: string | undefined;
  isBiometricUserAvailable: boolean;
  isAuthenticated: boolean;
};

const initialState: userType = {
  user: {},
  saveimageUrl: '',
  isBiometricUserAvailable: false,
  isAuthenticated: false,
};

const userDataSlicer = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserData(state, action: PayloadAction<Record<string, any>>) {
      state.user = action.payload;
      // Authenticated when payload is a real user object with an id,
      // unauthenticated when it is reset to an empty object on logout.
      state.isAuthenticated = !!(action.payload && action.payload.id);
    },
    setAvatarImage(state, action: PayloadAction<string | undefined>) {
      state.saveimageUrl = action.payload;
    },
    isBiometricUser(state, { payload }: PayloadAction<boolean>) {
      state.isBiometricUserAvailable = payload;
    },
  },
});

export const userData = userDataSlicer.reducer;
export const { setUserData, setAvatarImage, isBiometricUser } = userDataSlicer.actions;
