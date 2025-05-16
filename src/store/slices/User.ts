import {createSlice, PayloadAction} from '@reduxjs/toolkit';

export type userType = {
  user: {};
  saveimageUrl: string | undefined;
  isBiometricUserAvailable: boolean;
};

const initialState: userType = {
  user: {},
  saveimageUrl: '',
  isBiometricUserAvailable: false,
};

const userDataSlicer = createSlice({
  name: 'user',
  initialState: initialState,
  reducers: {
    setUserData(state, action) {
      state.user = action.payload;
    },
    setAvatarImage: (state, action) => {
      console.log('🚀 ~ setAvatarImage redux:', state.saveimageUrl);
      state.saveimageUrl = action.payload;
    },
    isBiometricUser: (state, {payload}: PayloadAction<boolean>) => {
      console.log(
        'redux isBbiometricAvailable',
        state.isBiometricUserAvailable,
      );
      state.isBiometricUserAvailable = payload;
    },
  },
});

export const userData = userDataSlicer.reducer;
export const {setUserData, setAvatarImage, isBiometricUser} =
  userDataSlicer.actions;
