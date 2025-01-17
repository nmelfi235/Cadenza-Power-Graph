import { createSlice } from "@reduxjs/toolkit";

export const dataSlice = createSlice({
  name: "data",
  initialState: {
    DPS: {
      pGoal: 5,
      meterScanTime: 30,
      scanTime: 6,
    },
    batterySettings: {
      maxSellAmps: 100,
      maxAmpHours: 800,
    },
    batteryState: {
      batteryVoltage: 54,
      batteryCurrent: 0,
      batterySOC: 100,
      batteryAmpHours: 800,
    },
    buildingPower: [
      {
        date: "01-01-1971",
        pActual: 1,
        pBuilding: 2,
        pBESS: 3,
        pMeter: 4,
        pGoal: 5,
        SOC: 6,
      },
      {
        date: "01-02-1971",
        pActual: 1,
        pBuilding: 2,
        pBESS: 3,
        pMeter: 4,
        pGoal: 5,
        SOC: 6,
      },
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
    setBatterySetting: (state, data) => {
      const { property, value } = data.payload;
      state.batterySettings[property] = value;
    },
    setDPSProperty: (state, data) => {
      const { property, value } = data.payload;
      state.DPS[property] = value;
      console.log(property, value);
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
  setDPSProperty,
  setBatteryState,
} = dataSlice.actions;

export default dataSlice.reducer;
