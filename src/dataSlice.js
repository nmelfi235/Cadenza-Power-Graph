import { createSlice } from "@reduxjs/toolkit";

export const dataSlice = createSlice({
  name: "data",
  initialState: {
    pGoal: 0,
    batteryState: {
      batteryVoltage: 54,
      batteryCurrent: 0,
      batterySOC: 100,
      maxAmpHours: 800,
      batteryAmpHours: 800,
      maxSellAmps: 100,
    },
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
    setPGoal: (state, data) => {
      state.pGoal = data.payload;
    },
    setBatteryState: (state, data) => {
      state.batteryState = data.payload;
    },
  },
});

export const {
  setBuildingData,
  setBatteryProfile,
  setEventTable,
  setPGoal,
  setBatteryState,
} = dataSlice.actions;

export default dataSlice.reducer;
