import { createSlice } from "@reduxjs/toolkit";

export const dataSlice = createSlice({
  name: "data",
  initialState: {
    buildingPower: [
      { date: "01-01-1971", power: 1 },
      { date: "01-02-1971", power: 1 },
    ],
    batteryProfile: [
      { date: "01-01-1971", voltage: 53, current: 0 },
      { date: "01-02-1971", voltage: 53, current: 0 },
    ],
  },
  reducers: {
    setBuildingData: (state, data) => {
      state.buildingPower = data.payload;
    },
    setBatteryProfile: (state, data) => {
      state.batteryProfile = data.payload;
    },
  },
});

export const { setBuildingData, setBatteryProfile } = dataSlice.actions;

export default dataSlice.reducer;
