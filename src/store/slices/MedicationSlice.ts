import {createSlice, PayloadAction} from '@reduxjs/toolkit';

export type userType = {
  medicationInfo: {
    text: string;
    initialnumber: number;
  };
};

const initialState: userType = {
  medicationInfo: {
    text: 'Only one day',
    initialnumber: 1,
  },
};

const MedicationSlice = createSlice({
  name: 'user',
  initialState: initialState,
  reducers: {
    setMedicationInfo: ({medicationInfo}, {payload}) => {
      console.log('~ medication info in redux :', medicationInfo);
      medicationInfo.text = payload;
      medicationInfo.initialnumber = payload;
    },
  },
});

export const MedicationData = MedicationSlice.reducer;
export const {setMedicationInfo} = MedicationSlice.actions;
