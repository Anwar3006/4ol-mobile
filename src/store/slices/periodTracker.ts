import {createSlice, PayloadAction} from '@reduxjs/toolkit';

export type PeriodTrackerType = {};

const initialState: PeriodTrackerType = {
  periodTrackerData: {},
};

const PeriodTraclerSlice = createSlice({
  name: 'PeriodTracker',
  initialState: initialState,
  reducers: {
    setPeriodTracker: (state: any, {payload}) => {
      //console.log('~ payload :', payload);
      state.periodTrackerData = payload;
      //console.log('~state periodTrackerType ::', state.periodTrackerData);
    },
  },
});

export const PeriodTracker = PeriodTraclerSlice.reducer;
export const {setPeriodTracker} = PeriodTraclerSlice.actions;
