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
        TotalPower: 2,
        BatteryPower: 3,
        ProjectedMeter: 4,
        PowerGoal: 5,
        SOC: 25,
        SolarPower: 0,
      },
      {
        date: "01-02-1971",
        MeterData: 1,
        TotalPower: 2,
        BatteryPower: 3,
        ProjectedMeter: 4,
        PowerGoal: 5,
        SOC: 25,
        SolarPower: 0,
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
      peakDataOn: 0,
      peakDataOff: 0,
      peakMeterOn: 0,
      peakMeterOff: 0,
      peakBESS: 0,
      recGoal: 0,
    },
    solarPower: [
      {
        date: "01-01-1971",
        power: 0,
      },
      {
        date: "01-02-1971",
        power: 0,
      },
    ],
    solarState: -1,
    solarStartTime: 0,
    solarEndTime: 1440,
    currentTariff: {
      peakPeriodStart: 0,
      peakPeriodEnd: 0,
      weekendsArePeak: false,
      holidays: [],
    },
    peakTotals: {
      onPeak: 0,
      offPeak: 0,
      onPeakBESS: 0,
      offPeakBESS: 0,
      totalEnergy: 0,
      totalEnergyBESS: 0,
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
          TotalPower: 2,
          BatteryPower: 3,
          ProjectedMeter: 4,
          PowerGoal: 5,
          SOC: 25,
          SolarPower: 0,
        },
        {
          date: "01-02-1971",
          MeterData: 1,
          TotalPower: 2,
          BatteryPower: 3,
          ProjectedMeter: 4,
          PowerGoal: 5,
          SOC: 25,
          SolarPower: 0,
        },
      ];
      state.energy = { charge: 0, discharge: 0 };
      state.peakTotals = {
        onPeak: 0,
        offPeak: 0,
        onPeakBESS: 0,
        offPeakBESS: 0,
        totalEnergy: 0,
        totalEnergyBESS: 0,
      };
      state.others = {
        minSOC: 100,
        peakDataOn: 0,
        peakDataOff: 0,
        peakMeterOn: 0,
        peakMeterOff: 0,
        peakBESS: 0,
        recGoal: 0,
      };
    },
    resetBatteryProfile: (state, data) => {
      state.batteryProfile = [
        { date: "01-01-1971", voltage: 53, current: 80 },
        { date: "01-02-1971", voltage: 53, current: 80 },
      ];
    },
    resetSolarData: (state, data) => {
      state.solarPower = [
        { date: "01-01-1971", power: 0 },
        { date: "01-02-1971", power: 0 },
      ];
      state.solarState = 0;
      state.solarStartTime = 0;
      state.solarEndTime = 0;
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
      const { time, power } = data.payload;
      const isOnPeak = isPeak(time, state.currentTariff);

      if (isOnPeak && power > state.others.peakDataOn)
        state.others.peakDataOn = power;
      else if (!isOnPeak && power > state.others.peakDataOff)
        state.others.peakDataOff = power;
    },
    getPeakMeter: (state, data) => {
      const { time, meter } = data.payload;
      const isOnPeak = isPeak(time, state.currentTariff);

      if (isOnPeak && meter > state.others.peakMeterOn)
        state.others.peakMeterOn = meter;
      else if (!isOnPeak && meter > state.others.peakMeterOff)
        state.others.peakMeterOff = meter;
    },
    getPeakBESS: (state, data) => {
      if (data.payload.BESS > state.others.peakBESS) {
        state.others.peakBESS = data.payload.BESS;
      }
    },
    setSolarData: (state, data) => {
      state.solarPower = data.payload;
      state.solarStartTime = Date.parse(data.payload[0].date);
      state.solarEndTime = Date.parse(
        data.payload[data.payload.length - 1].date,
      );
    },
    setSolarState: (state, data) => {
      state.solarState = data.payload;
    },
    setRecGoal: (state, data) => {
      // Can probably approximate it using the total energy used over the year and the max capacity of the battery to get a predicted constant cycle number. Aim for one cycle per day to start.
      // Max capacity * 20 in kWh / max discharge power in kW = max continuous discharge time in hours
      // Total Energy Needed in kWh / Data time length in hours = Average power usage in kW
      const goal =
        state.buildingPower.reduce(
          (curr, datum) =>
            curr +
            (datum.MeterData + datum.SolarPower) /
              (state.batterySettings.maxAmpHours / 20 / 1000) /
              60,
          0,
        ) /
        (state.buildingPower.length / 60);
      state.others.recGoal = goal;
    },
    setTariff: (state, data) => {
      state.currentTariff = data.payload;
    },
    addPeakUsage: (state, data) => {
      const { BESS, value, time } = data.payload;
      const isOnPeak = isPeak(time, state.currentTariff);

      if (!BESS) state.peakTotals.totalEnergy += value;
      else if (BESS) state.peakTotals.totalEnergyBESS += value;

      if (isOnPeak)
        BESS
          ? (state.peakTotals.onPeakBESS += value)
          : (state.peakTotals.onPeak += value);

      state.peakTotals.offPeak =
        state.peakTotals.totalEnergy - state.peakTotals.onPeak;
      state.peakTotals.offPeakBESS =
        state.peakTotals.totalEnergyBESS - state.peakTotals.onPeakBESS;
    },
  },
});

function isPeak(date, tariff) {
  const time = new Date(date);
  const { peakPeriodStart, peakPeriodEnd, weekendsArePeak, holidays } = tariff;

  const startOfToday = new Date(
    time.getFullYear(),
    time.getMonth(),
    time.getDate(),
    parseInt(peakPeriodStart),
    0,
    0,
    0,
  );

  const endOfToday = new Date(
    time.getFullYear(),
    time.getMonth(),
    time.getDate(),
    parseInt(peakPeriodEnd),
    0,
    0,
    0,
  );

  const minutesBetween = (t1, t2) => {
    return (t2.getTime() - t1.getTime()) / (1000 * 60);
  };

  const isWeekend = () => {
    const dayOfWeek = time.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6;
  };

  const isHoliday = (time) => {
    const holiday = new Holidays("US");
    //console.log(holiday.isHoliday(time)[0]["name"]);

    return holidays.includes(holiday.isHoliday(time)[0]?.name);
  };

  return (
    minutesBetween(startOfToday, time) > 0 &&
    minutesBetween(time, endOfToday) >= 0
    //&& !isHoliday(time)
    //&& !(isWeekend() && !weekendsArePeak)
  );
}

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
  resetSolarData,
  addEnergy,
  getSOC,
  getPeakPower,
  getPeakMeter,
  getPeakBESS,
  setSolarData,
  setSolarState,
  setRecGoal,
  setTariff,
  addPeakUsage,
} = dataSlice.actions;

export default dataSlice.reducer;
