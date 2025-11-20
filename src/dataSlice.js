import { createSlice } from "@reduxjs/toolkit";

export const dataSlice = createSlice({
  name: "data",
  initialState: {
    ACLoadPower: 0,
    Arbitrage: {
      startOfDischarge: 0,
      endOfDischarge: 0,
      usableEnergy: 90,
    },
    DPS: {
      pGoal: 5,
      chargeClearance: 0, // new feature where DPS won't initiate a charge if it is too close to the goal (kW)
      meterScanTime: 30,
      scanTime: 6,
    },
    batterySettings: {
      maxChargePower: 6,
      maxDischargePower: 6,
      maxAmpHours: 800,
      initialSOC: 100,
      stateOfHealth: 100,
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
        MeterData: 1,
        //pBuilding: 2,
        BatteryPower: 3,
        ProjectedMeter: 4,
        PowerGoal: 5,
        SOC: 25,
      },
      {
        date: "01-02-1971",
        MeterData: 1,
        //pBuilding: 2,
        BatteryPower: 3,
        ProjectedMeter: 4,
        PowerGoal: 5,
        SOC: 25,
      },
    ],
    batteryProfile: [
      { date: "01-01-1971", voltage: 53, current: 80 },
      { date: "01-02-1971", voltage: 53, current: 80 },
    ],
    eventCount: 0,
    events: [],
    energy: {
      discharge: 0,
      charge: 0,
    },
    others: {
      minSOC: 100,
      peakData: 0,
      peakMeter: 0,
      peakBESS: 0,
    },
  },
  reducers: {
    setACLoadPower: (state, data) => {
      state.ACLoadPower = data.payload;
    },
    setBuildingData: (state, data) => {
      state.buildingPower = data.payload;
    },
    setBatteryProfile: (state, data) => {
      state.batteryProfile = data.payload;
    },
    setEventTable: (state, data) => {
      state.events = data.payload;
    },
    insertEvent: (state, data) => {
      data.payload.eventID = state.eventCount;
      state.eventCount++;
      console.log(data.payload);
      state.events.push(data.payload);
    },
    setBatterySetting: (state, data) => {
      const { property, value } = data.payload;
      state.batterySettings[property] = value;
    },
    setArbitrageProperty: (state, data) => {
      const { property, value } = data.payload;
      state.Arbitrage[property] = value;
      console.log(property, value);
    },
    setDPSProperty: (state, data) => {
      const { property, value } = data.payload;
      state.DPS[property] = value;
      console.log(property, value);
    },
    setBatteryState: (state, data) => {
      state.batteryState = data.payload;
    },
    resetBuildingData: (state, data) => {
      state.buildingPower = [
        {
          date: "01-01-1971",
          MeterData: 1,
          //pBuilding: 2,
          BatteryPower: 3,
          ProjectedMeter: 4,
          PowerGoal: 5,
          SOC: 25,
        },
        {
          date: "01-02-1971",
          MeterData: 1,
          //pBuilding: 2,
          BatteryPower: 3,
          ProjectedMeter: 4,
          PowerGoal: 5,
          SOC: 25,
        },
      ];
      state.energy = { charge: 0, discharge: 0 };
      state.others = { minSOC: 100, peakData: 0, peakMeter: 0, peakBESS: 0 };
    },
    resetBatteryProfile: (state, data) => {
      state.batteryProfile = [
        { date: "01-01-1971", voltage: 53, current: 80 },
        { date: "01-02-1971", voltage: 53, current: 80 },
      ];
    },
    addEnergy: (state, data) => {
      const { type, energy } = data.payload;
      state.energy[type] += energy;
    },
    getSOC: (state, data) => {
      if (state.batteryState.batterySOC < state.others.minSOC) {
        state.others.minSOC = state.batteryState.batterySOC;
      }
    },
    getPeakPower: (state, data) => {
      if (data.payload.power > state.others.peakData) {
        state.others.peakData = data.payload.power;
      }
    },
    getPeakMeter: (state, data) => {
      if (data.payload.meter > state.others.peakMeter) {
        state.others.peakMeter = data.payload.meter;
      }
    },
    getPeakBESS: (state, data) => {
      if (data.payload.BESS > state.others.peakBESS) {
        state.others.peakBESS = data.payload.BESS;
      }
    },
  },
});

export const {
  setACLoadPower,
  setBuildingData,
  setBatteryProfile,
  setEventTable,
  insertEvent,
  setBatterySetting,
  setArbitrageProperty,
  setDPSProperty,
  setBatteryState,
  resetBuildingData,
  resetBatteryProfile,
  addEnergy,
  getSOC,
  getPeakPower,
  getPeakMeter,
  getPeakBESS,
} = dataSlice.actions;

export default dataSlice.reducer;
