import { createSlice } from "@reduxjs/toolkit";

export const dataSlice = createSlice({
  name: "data",
  initialState: {
    buildingPower: [
      { date: "01-01-1971", pActual: 1 },
      { date: "01-02-1971", pActual: 1 },
    ],
    batteryProfile: [
      { date: "01-01-1971", voltage: 53, current: 80 },
      { date: "01-02-1971", voltage: 53, current: 80 },
    ],
    events: [
      {
        eventID: 0,
        eventType: "discharge",
        startTime: "0:00",
        endTime: "9:00",
        powerLevel: 5,
      },
      {
        eventID: 1,
        eventType: "charge",
        startTime: "9:00",
        endTime: "12:00",
        powerLevel: 5,
      },
    ],
  },
  reducers: {
    setBuildingData: (state, data) => {
      state.buildingPower = data.payload;
    },
    setBatteryProfile: (state, data) => {
      state.batteryProfile = data.payload;
    },
    setEventTable: (state, data) => {
      state.events = data.payload;
    },
  },
});

export const { setBuildingData, setBatteryProfile, setEventTable } =
  dataSlice.actions;

export default dataSlice.reducer;
