import store from "./store";
import { setBatteryState, setDPSProperty } from "../dataSlice";
// This file holds the calculations for each DPS line.

// The DPS System evaluates its desired operation and power level every time interval tDPS.
// The metering time interval tMeter varies depending on BESS installation location and is defined by the electrical tariff in use at the location.
//   t values should be in minutes.
const tDPS = 3;
const percentError = 0.05; // Efficiency of BESS is 95%
let tLast = new Date(0); // This value is used to calculate when pMeter should change.
let oldDate = null; // This value is used to store the date value of the last data point used.
let dpsStartDate = null; // This value is used to store the date value of when the last DPS charge started.
let pLast = 0; // This value is used to keep the pMeter consistent.
let DPSflag = false;

// Power to energy unit conversion factor
const powerToEnergy = (power, minutes) => {
  let energy = (power * minutes) / 60;

  return energy;
};

// Energy to Power unit conversion factor
const energyToPower = (energy, minutes) => {
  let power = (energy * 60) / minutes;

  return power;
};

// Calculates minutes between two dates
const minutesBetween = (date0, date1) => {
  return (new Date(date1) - new Date(date0)) / (1000 * 60);
};

// pGoal refers to the building power level that the DPS system is attempting to maintain and is described in more detail in Section 3.2
export const pGoal = (goal = 0) => {
  const stateGoal = store.getState().data.DPS.pGoal;
  if (goal !== stateGoal) store.dispatch(setDPSProperty(goal));

  return store.getState().data.DPS.pGoal;
};

// pActual refers to the power level as seen at the WattNode, i.e. positioned directly behind the building's utility meter.
//   pActual will be negative when the building is providing power to the grid and positive otherwise.
export const pActual = (power) => {
  return power;
};

// pBuilding refers to pActual with the battery power contribution removed.
export const pBuilding = (date, power) => {
  return power - pBESSNoEffects(date, power); // Add them together because pBESS is positive during a charge, and positive means pulling from grid.
};

// pDPS refers to the DPS power level at which the BESS should either charge or discharge for peak shaving.
//   pDPS will be negative when the battery SHOULD discharge and positive when the battery SHOULD charge.

// pBESS refers to the real-time AC power level of the BESS installation.
//   If the BESS has multiple aggregated systems, pBESS is the sum of the individual systems' power level.
//   pBESS should be negative when the battery is Charging and positive when the battery is Discharging.
//   This is the BESS's actual power contribution as determined by the operational logic.
export const pBESSBattery = (date, batteryProfile) => {
  let nearestProfile;
  for (const datum of batteryProfile) {
    nearestProfile = datum;
    if (nearestProfile.date > date) break;
  }
  return (
    ((-percentError + Math.random() * percentError * 2) *
      (nearestProfile.voltage * nearestProfile.current)) /
    1000
  );
};

export const pBESS = (date, power) => {
  const goal = store.getState().data.DPS.pGoal;
  // Charge/Discharge/Idle calculation is done in CalcBatteryState.
  if (oldDate === null) oldDate = date;
  calcBatteryState(date, pBuilding(date, power) - goal);
  oldDate = date;

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
export const pMeter = (date, power) => {
  const tMeter = store.getState().data.DPS.meterScanTime;
  if (minutesBetween(new Date(date), tLast) >= 0) {
    tLast = new Date(0);
    pLast = 0;
  }
  if (minutesBetween(tLast, date) >= tMeter) {
    tLast = date;
    pLast = pBuilding(date, power);
  }

  return pLast;
};

// Function tree-- calcBatteryState determines whether the battery should be charging, discharging, or idle.
// First, check if battery should charge-- if DPS flag is on, skip this step. If power > goal, skip this step. If charge is already full, skip this step.
//  If battery should charge, go to charge function.
//    If requested power level > battery power capacity then set power level to match capacity.
// Next, check if battery should discharge-- if battery is empty, skip this step.
//  If requested power level > battery power capacity then set power level to match capacity.
export const calcBatteryState = (date, power) => {
  const { batteryVoltage, batteryCurrent, batterySOC, batteryAmpHours } =
    store.getState().data.batteryState;

  const { maxAmpHours, maxSellAmps } = store.getState().data.batterySettings;
  const goal = store.getState().data.DPS.pGoal;

  // First, check if battery should charge-- if DPS flag is on, skip this step. If power > goal, skip this step. If charge is already full, skip this step.
  if (power < 0 && !DPSflag && power < goal && batterySOC < 100)
    chargeBattery(date, -power);
  // send negative power because negative power is a charge here. Converts to positive.
  // Next, check if battery should discharge-- if battery is empty, skip this step. If power < goal, skip this step.
  else if (power > 0 && power > goal && batterySOC > 0)
    dischargeBattery(date, power);
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
  return 48 + (54 - 48) * (soc / 100);
};

const chargeBattery = (date, power) => {
  const { batteryVoltage, batteryCurrent, batterySOC, batteryAmpHours } =
    store.getState().data.batteryState;

  const { maxAmpHours, maxSellAmps } = store.getState().data.batterySettings;

  const currentAdded =
    (power * 1000) / batteryVoltage > maxSellAmps
      ? maxSellAmps
      : (power * 1000) / batteryVoltage; // because power (W) = voltage (V) * current (A), scale power from kW to W
  const ampHoursAdded = (minutesBetween(oldDate, date) / 60) * currentAdded; // because amp-hours (Ah) = current (A) * hours (h), scale minutes to hours
  const newAmpHours =
    batteryAmpHours + ampHoursAdded > maxAmpHours
      ? maxAmpHours
      : batteryAmpHours + ampHoursAdded;
  const newSOC = (newAmpHours / maxAmpHours) * 100;
  const newVoltage = getNewVoltage(newSOC);

  // newCurrent only needs to be calculated after DPS scan time has passed.
  if (dpsStartDate === null) dpsStartDate = date;
  const newCurrent =
    minutesBetween(dpsStartDate, date) > store.getState().data.DPS.scanTime
      ? (power * 1000) / newVoltage +
        (-percentError + Math.random() * percentError * 2) *
          ((power * 1000) / newVoltage)
      : batteryCurrent;
  if (minutesBetween(dpsStartDate, date) > store.getState().data.DPS.scanTime)
    dpsStartDate = date;
  store.dispatch(
    setBatteryState({
      batteryVoltage: newVoltage,
      batteryCurrent: -newCurrent,
      batterySOC: newSOC,
      batteryAmpHours: newAmpHours,
    })
  );
};

const dischargeBattery = (date, power) => {
  const { batteryVoltage, batteryCurrent, batterySOC, batteryAmpHours } =
    store.getState().data.batteryState;

  const { maxAmpHours, maxSellAmps } = store.getState().data.batterySettings;

  const currentRemoved =
    (power * 1000) / batteryVoltage > maxSellAmps
      ? maxSellAmps
      : (power * 1000) / batteryVoltage; // because power (W) = voltage (V) * current (A), scale power from kW to W
  const ampHoursRemoved = (minutesBetween(oldDate, date) / 60) * currentRemoved; // because amp-hours (Ah) = current (A) * hours (h), scale minutes to hours
  const newAmpHours = batteryAmpHours - ampHoursRemoved;
  const newSOC = (newAmpHours / maxAmpHours) * 100;
  const newVoltage = getNewVoltage(newSOC);

  // newCurrent only needs to be calculated after DPS scan time has passed.
  if (dpsStartDate === null) dpsStartDate = date;
  const newCurrent =
    minutesBetween(dpsStartDate, date) > store.getState().data.DPS.scanTime
      ? (power * 1000) / newVoltage +
        (-percentError + Math.random() * percentError * 2) *
          ((power * 1000) / newVoltage)
      : batteryCurrent;
  if (minutesBetween(dpsStartDate, date) > store.getState().data.DPS.scanTime)
    dpsStartDate = date;
  store.dispatch(
    setBatteryState({
      batteryVoltage: newVoltage,
      batteryCurrent: newCurrent,
      batterySOC: newSOC,
      batteryAmpHours: newAmpHours,
    })
  );
};
