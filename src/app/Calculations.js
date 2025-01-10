import store from "./store";
import { setBatteryState, setPGoal } from "../dataSlice";
// This file holds the calculations for each DPS line.

// The DPS System evaluates its desired operation and power level every time interval tDPS.
// The metering time interval tMeter varies depending on BESS installation location and is defined by the electrical tariff in use at the location.
//   t values should be in minutes.
const tDPS = 3;
const tMeter = 15;
let tLast = new Date(0); // This value is used to calculate when pMeter should change.
let oldDate = null; // This value is used to store the date value of the last data point used.
let pLast = 0; // This value is used to keep the pMeter consistent.

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
  const stateGoal = store.getState().data.pGoal;
  if (goal !== stateGoal) store.dispatch(setPGoal(goal));

  return store.getState().data.pGoal;
};

// pActual refers to the power level as seen at the WattNode, i.e. positioned directly behind the building's utility meter.
//   pActual will be negative when the building is providing power to the grid and positive otherwise.
export const pActual = (power) => {
  return power;
};

// pBuilding refers to pActual with the battery power contribution removed.
export const pBuilding = (date, power) => {
  return power - pBESS(date, power); // Add them together because pBESS is positive during a charge, and positive means pulling from grid.
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
  return (nearestProfile.voltage * nearestProfile.current) / 1000;
};

export const pBESS = (date, power) => {
  const goal = store.getState().data.pGoal;
  if (power > goal) calcBatteryState(date, power - goal);
  else calcBatteryState(date, 0);
  const { batteryVoltage, batteryCurrent } = store.getState().data.batteryState;
  return (batteryVoltage * batteryCurrent) / 1000;
};

// pMeter refers to the average power usage as would be measured by the utility meter, estimated by the WattNode against the measured demand time interval.
//   The time interval for the meter average varies depending on the tariff in use and is separate from the DPS timing.
export const pMeter = (date, power) => {
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

export const calcBatteryState = (date, power) => {
  const {
    batteryVoltage,
    batteryCurrent,
    batterySOC,
    maxAmpHours,
    batteryAmpHours,
    maxSellAmps,
  } = store.getState().data.batteryState;

  if (batteryVoltage <= 48) {
    store.dispatch(
      setBatteryState({
        batteryVoltage: batteryVoltage,
        batteryCurrent: 0,
        batterySOC: 0,
        maxAmpHours: maxAmpHours,
        batteryAmpHours: batteryAmpHours,
        maxSellAmps: maxSellAmps,
      })
    );
    return;
  }

  const currentRemoved =
    (power * 1000) / batteryVoltage > maxSellAmps
      ? maxSellAmps
      : (power * 1000) / batteryVoltage; // because power (W) = voltage (V) * current (A), scale power from kW to W
  console.log(currentRemoved);
  if (oldDate === null) oldDate = new Date(date);
  const ampHoursRemoved = (minutesBetween(oldDate, date) / 60) * currentRemoved; // because amp-hours (Ah) = current (A) * hours (h), scale minutes to hours
  const newAmpHours = batteryAmpHours - ampHoursRemoved;
  const newSOC = (newAmpHours / maxAmpHours) * 100;
  const newVoltage = getNewVoltage(newSOC);
  const newCurrent = (power * 1000) / newVoltage;
  store.dispatch(
    setBatteryState({
      batteryVoltage: newVoltage,
      batteryCurrent: newCurrent,
      batterySOC: newSOC,
      maxAmpHours: maxAmpHours,
      batteryAmpHours: newAmpHours,
      maxSellAmps: maxSellAmps,
    })
  );
  oldDate = new Date(date);
};

const getNewVoltage = (soc) => {
  return 48 + (54 - 48) * (soc / 100);
};
