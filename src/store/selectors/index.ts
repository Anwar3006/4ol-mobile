import {createSelector} from '@reduxjs/toolkit';
import {RootState} from '..';

// user profile
export const userData = (state: RootState) => state.userData;
export const user = createSelector(userData, (state: any) => state.user);
