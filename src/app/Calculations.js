import store from "./store";
import { setBatteryState, setDPSProperty } from "../dataSlice";
// This file holds the calculations for each DPS line.

// The DPS System evaluates its desired operation and power level every time interval tDPS.
// The metering time interval tMeter varies depending on BESS installation location and is defined by the electrical tariff in use at the location.
//   t values should be in minutes.
let tLast = new Date(0); // This value is used to calculate when pMeter should change.
let oldDate = null; // This value is used to store the date value of the last data point used.
let dpsStartDate = null; // This value is used to store the date value of when the last DPS charge started.
let pLast = 0; // This value is used to keep the pMeter consistent.
let DPSflag = false;

// Helper function to calculate minutes between two dates
const minutesBetween = (date0, date1) => {
  return (Date.parse(date1) - Date.parse(date0)) / (1000 * 60);
};

// pGoal refers to the building power level that the DPS system is attempting to maintain and is described in more detail in Section 3.2
// Function takes an optional goal as input to set the goal, and it also returns the power goal.
export const pGoal = (goal = null) => {
  const stateGoal = store.getState().data.DPS.pGoal;
  if (goal !== stateGoal && goal !== null) store.dispatch(setDPSProperty(goal));

  return store.getState().data.DPS.pGoal;
};

// pActual refers to the power level as seen at the WattNode, i.e. positioned directly behind the building's utility meter.
//   pActual will be negative when the building is providing power to the grid and positive otherwise.
//  Takes raw pActual as input and returns the value.
export const pActual = (power) => {
  return power;
};

// pBuilding refers to pActual with the battery power contribution removed.
//  Takes the current date of the data point and raw pActual as input
//  and returns powerActual with battery contribution removed.
export const pBuilding = (date, powerActual) => {
  return powerActual - pBESSNoEffects(date, powerActual); // Add them together because pBESS is positive during a charge, and positive means pulling from grid.
};

// pDPS refers to the DPS power level at which the BESS should either charge or discharge for peak shaving.
//   pDPS will be negative when the battery SHOULD discharge and positive when the battery SHOULD charge.

// pBESS refers to the real-time AC power level of the BESS installation.
//   If the BESS has multiple aggregated systems, pBESS is the sum of the individual systems' power level.
//   pBESS should be negative when the battery is Charging and positive when the battery is Discharging.
//   This is the BESS's actual power contribution as determined by the operational logic.
export const pBESS = (currentDate, powerActual) => {
  const goal = store.getState().data.DPS.pGoal;

  // Reset battery when graph is reset (oldDate is after current date when graph is reset)
  if (oldDate === null || minutesBetween(oldDate, currentDate) < 0) {
    console.error(
      "NULL DATE!!" + oldDate + currentDate + (oldDate > currentDate)
    );
    oldDate = currentDate;
    const batterySettings = store.getState().data.batterySettings;
    store.dispatch(
      setBatteryState({
        batteryVoltage: getNewVoltage(batterySettings.initialSOC),
        batteryCurrent: 0,
        batterySOC: batterySettings.initialSOC,
        batteryAmpHours:
          batterySettings.maxAmpHours * (batterySettings.initialSOC / 100),
      })
    );
  }

  // Charge/Discharge/Idle calculation is done in CalcBatteryState.
  calcBatteryState(currentDate, powerActual - goal);
  oldDate = currentDate;

  // After the state has changed, the voltage and current will be updated.
  const { batteryVoltage, batteryCurrent } = store.getState().data.batteryState;

  // Returns the power level calculated by the returned voltage and current.
  return (batteryVoltage * batteryCurrent) / 1000;
};

const pBESSNoEffects = (date, power) => {
  const { batteryVoltage, batteryCurrent } = store.getState().data.batteryState;
  return (batteryVoltage * batteryCurrent) / 1000;
};

// pMeter refers to the average power usage as would be measured by the utility meter, estimated by the WattNode against the measured demand time interval.
//   The time interval for the meter average varies depending on the tariff in use and is separate from the DPS timing.
export const pMeter = (date, powerActual) => {
  const tMeter = store.getState().data.DPS.meterScanTime;
  if (minutesBetween(new Date(date), tLast) >= 0) {
    tLast = new Date(0);
    pLast = 0;
  }
  if (minutesBetween(tLast, date) >= tMeter) {
    tLast = date;
    pLast = pBuilding(date, powerActual);
  }

  return pLast;
};

const getLatestEvent = (date, eventList) => {
  const dateHHMM = [new Date(date).getHours(), new Date(date).getMinutes()];
  return eventList.reduce((currentEvent, event) => {
    const startTime = event.startTime.split(":").map((el) => parseInt(el));
    const endTime = event.endTime.split(":").map((el) => parseInt(el));

    const dayTimeEvent =
      startTime[0] < endTime[0] ||
      (startTime[0] === endTime[0] && startTime[1] < endTime[1]);
    const nightTimeEvent =
      startTime[0] > endTime[0] ||
      (startTime[0] === endTime[0] && startTime[1] > endTime[1]);
    const afterStartTime =
      startTime[0] < dateHHMM[0] ||
      (startTime[0] === dateHHMM[0] && startTime[1] < dateHHMM[1]);
    const beforeEndTime =
      dateHHMM[0] < endTime[0] ||
      (dateHHMM[0] === endTime[0] && dateHHMM[1] < endTime[1]);
    const sameStartEndTime =
      startTime[0] === endTime[0] && startTime[1] === endTime[1];

    if (dayTimeEvent && afterStartTime && beforeEndTime && !sameStartEndTime) {
      // Daytime event, after start time (morning), before end time (evening)
      return event;
    } else if (
      (nightTimeEvent && afterStartTime) ||
      (nightTimeEvent && beforeEndTime && !sameStartEndTime)
    ) {
      // Not a daytime event, after end time (overnight), before start time (morning)
      return event;
    }
    return currentEvent;
  }, null);
};

// Function tree-- calcBatteryState determines whether the battery should be charging, discharging, or idle.
// First, check if battery should charge-- if DPS flag is on, skip this step. If power > goal, skip this step. If charge is already full, skip this step.
//  If battery should charge, go to charge function.
//    If requested power level > battery power capacity then set power level to match capacity.
// Next, check if battery should discharge-- if battery is empty, skip this step.
//  If requested power level > battery power capacity then set power level to match capacity.
export const calcBatteryState = (date, powerFromGoal) => {
  const { batteryVoltage, batteryCurrent, batterySOC, batteryAmpHours } =
    store.getState().data.batteryState;
  const eventList = store.getState().data.events;
  const latestEvent = getLatestEvent(date, eventList);
  const { endOfDay } = store.getState().data.DPS;
  const { maxDischargePower } = store.getState().data.batterySettings;
  const endOfToday = new Date(
    new Date(date).getFullYear(),
    new Date(date).getMonth(),
    new Date(date).getDate(),
    endOfDay,
    0,
    0,
    0
  );

  // Full discharge at end of day overrides other events.
  // if minutesLeft >= minutesBetween now and "end of day", then discharge at full power until "end of day".
  if (
    minutesLeft() >= minutesBetween(date, endOfToday) &&
    minutesBetween(date, endOfToday) > 0
  ) {
    dischargeBattery(date, maxDischargePower);
    return;
  }

  // First, check if battery should charge-- if DPS flag is on, skip this step. If power > goal, skip this step. If charge is already full, skip this step.
  if (
    (latestEvent?.eventType !== "Discharge" &&
      latestEvent?.eventType === "Charge") ||
    (latestEvent?.eventType !== "Discharge" &&
      powerFromGoal < 0 &&
      batterySOC < 100)
  )
    chargeBattery(
      date,
      !(latestEvent && latestEvent.eventType === "Charge")
        ? -powerFromGoal - store.getState().data.ACLoadPower
        : parseFloat(latestEvent.powerLevel)
    );
  // send negative power because negative power is a charge here. Converts to positive.
  // Next, check if battery should discharge-- if battery is empty, skip this step. If power < goal, skip this step.
  else if (
    latestEvent?.eventType === "Discharge" ||
    (powerFromGoal > 0 && batterySOC > 0)
  )
    dischargeBattery(
      date,
      !(latestEvent && latestEvent.eventType === "Discharge")
        ? powerFromGoal
        : parseFloat(latestEvent.powerLevel)
    );
  else if (!latestEvent) {
    store.dispatch(
      setBatteryState({
        batteryVoltage: batteryVoltage,
        batteryCurrent: 0,
        batterySOC: batterySOC,
        batteryAmpHours: batteryAmpHours,
      })
    );
  }

  // Case where battery is low voltage, this case prevents underflow and also cancels a discharge.
  if (batteryVoltage <= 48) {
    store.dispatch(
      setBatteryState({
        batteryVoltage: batteryVoltage,
        batteryCurrent: 0,
        batterySOC: 0,
        batteryAmpHours: batteryAmpHours,
      })
    );
    return;
  }

  // Need to add more cases here-- DPS flag should be turned on when the battery is discharging, and after a set amount of time it returns to normal operation mode where the battery is allowed to charge.
  // If the building power is less than the goal and the DPS flag is off, then battery is allowed to charge.
  // In the case that the DPS flag is on and the building power is less than the goal, the battery power is set to zero and the DPS flag stays on until the set amount of time has passed.
  // Also need to add DPS Scan Time so the power doesn't change at every tick-- it's unrealistic and looks too ideal.
};

const getNewVoltage = (soc) => {
  return 45.0521 * soc ** 0.03631896; // derived from exponential curve fitting calculator
  // return 48 + (54 - 48) * (soc / 100); // default linear estimate for soc to voltage map
};

const getNewChargeCurrent = (power, voltage) => {
  const maxChargePower = store.getState().data.batterySettings.maxChargePower;
  const chargeClearance = parseFloat(store.getState().data.DPS.chargeClearance);
  //console.log(power, chargeClearance);

  return power < chargeClearance || maxChargePower < chargeClearance // current should not be less than the charge clearance UNLESS the power level comes from an event (?)
    ? 0
    : power > maxChargePower // current should not be greater than max power current
    ? (maxChargePower * 1000) / voltage
    : (power * 1000) / voltage; // because power (W) = voltage (V) * current (A), scale power from kW to W
};

const getNewDischargeCurrent = (power, voltage) => {
  const maxDischargePower =
    store.getState().data.batterySettings.maxDischargePower;

  return power > maxDischargePower // current should not be greater than max power current
    ? (maxDischargePower * 1000) / voltage
    : (power * 1000) / voltage; // because power (W) = voltage (V) * current (A), scale power from kW to W
};

const chargeBattery = (date, power) => {
  const { batteryVoltage, batteryCurrent, batterySOC, batteryAmpHours } =
    store.getState().data.batteryState;

  const { maxAmpHours } = store.getState().data.batterySettings;

  const currentAdded = getNewChargeCurrent(power, batteryVoltage);
  const ampHoursAdded = (minutesBetween(oldDate, date) / 60) * currentAdded; // because amp-hours (Ah) = current (A) * hours (h), scale minutes to hours
  const newAmpHours =
    batteryAmpHours + ampHoursAdded > maxAmpHours
      ? maxAmpHours
      : batteryAmpHours + ampHoursAdded;
  const newSOC = (newAmpHours / maxAmpHours) * 100;
  const newVoltage = getNewVoltage(newSOC);

  // newCurrent only needs to be calculated after DPS scan time has passed.
  if (dpsStartDate === null || dpsStartDate > date) dpsStartDate = date;

  const newCurrent =
    minutesBetween(dpsStartDate, date) > store.getState().data.DPS.scanTime
      ? -getNewChargeCurrent(power, newVoltage)
      : batteryCurrent;

  if (minutesBetween(dpsStartDate, date) > store.getState().data.DPS.scanTime)
    dpsStartDate = date;

  store.dispatch(
    setBatteryState({
      batteryVoltage: newVoltage,
      batteryCurrent:
        newSOC >= 100 // state of charge should not be greater than 100, so halt the charge if it gets to 100
          ? 0
          : newCurrent,
      batterySOC: newSOC,
      batteryAmpHours: newAmpHours,
    })
  );
};

const dischargeBattery = (date, power) => {
  //console.log("DISCHARGING AT " + power + " kW!");
  const { batteryVoltage, batteryCurrent, batterySOC, batteryAmpHours } =
    store.getState().data.batteryState;

  const { maxAmpHours, maxDischargePower } =
    store.getState().data.batterySettings;

  const currentRemoved = getNewDischargeCurrent(power, batteryVoltage);
  const ampHoursRemoved = (minutesBetween(oldDate, date) / 60) * currentRemoved; // because amp-hours (Ah) = current (A) * hours (h), scale minutes to hours
  const newAmpHours = batteryAmpHours - ampHoursRemoved;
  const newSOC = (newAmpHours / maxAmpHours) * 100;
  const newVoltage = getNewVoltage(newSOC);

  // newCurrent only needs to be calculated after DPS scan time has passed.
  if (dpsStartDate === null || dpsStartDate > date) dpsStartDate = date;

  const newCurrent =
    minutesBetween(dpsStartDate, date) > store.getState().data.DPS.scanTime
      ? getNewDischargeCurrent(power, newVoltage)
      : batteryCurrent;

  if (minutesBetween(dpsStartDate, date) > store.getState().data.DPS.scanTime)
    dpsStartDate = date;

  store.dispatch(
    setBatteryState({
      batteryVoltage: newVoltage,
      batteryCurrent: newSOC <= 0 ? 0 : newCurrent,
      batterySOC: newSOC,
      batteryAmpHours: newAmpHours,
    })
  );
};

// minutesLeft function calculates how many minutes are left on the battery at a given power level.
const minutesLeft = () => {
  const { maxAmpHours, usableEnergy, stateOfHealth, maxDischargePower } =
    store.getState().data.batterySettings;
  const { batteryVoltage, batterySOC } = store.getState().data.batteryState;

  // 60 (minutes per hour) * Max Capacity (kWh) * usable energy (% input by user on GUI) * SOC * SOH / maxDischargePower (kW) = minutes left (minutes)
  return (
    (60 *
      maxAmpHours *
      batteryVoltage *
      (usableEnergy / 100) *
      (batterySOC / 100) *
      (stateOfHealth / 100)) /
    (maxDischargePower * 1000)
  );
};
