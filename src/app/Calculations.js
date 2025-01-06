// This file holds the calculations for each DPS line.

// The DPS System evaluates its desired operation and power level every time interval tDPS.
// The metering time interval tMeter varies depending on BESS installation location and is defined by the electrical tariff in use at the location.
//   t values should be in minutes.
const tDPS = 3;
const tMeter = 15;
let tLast = new Date(0);
let pLast = 0;

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

// pActual refers to the power level as seen at the WattNode, i.e. positioned directly behind the building's utility meter.
//   pActual will be negative when the building is providing power to the grid and positive otherwise.
export const pActual = (power) => {
  return power;
};

// pBuilding refers to pActual with the battery power contribution removed.
export const pBuilding = (date, power, batteryProfile) => {
  return power + pBESS(date, batteryProfile); // Add them together because pBESS is positive during a charge, and positive means pulling from grid.
};

// pDPS refers to the DPS power level at which the BESS should either charge or discharge for peak shaving.
//   pDPS will be negative when the battery SHOULD discharge and positive when the battery SHOULD charge.

// pBESS refers to the real-time AC power level of the BESS installation.
//   If the BESS has multiple aggregated systems, pBESS is the sum of the individual systems' power level.
//   pBESS should be negative when the battery is Charging and positive when the battery is Discharging.
//   This is the BESS's actual power contribution as determined by the operational logic.
export const pBESS = (date, batteryProfile) => {
  let nearestProfile;
  for (const datum of batteryProfile) {
    nearestProfile = datum;
    if (nearestProfile.date > date) break;
  }
  return (nearestProfile.voltage * nearestProfile.current) / 1000;
};

// pMeter refers to the average power usage as would be measured by the utility meter, estimated by the WattNode against the measured demand time interval.
//   The time interval for the meter average varies depending on the tariff in use and is separate from the DPS timing.
export const pMeter = (date, power) => {
  if (date == new Date(0).toString()) {
    tLast = new Date(0);
    pLast = 0;
  }
  if (minutesBetween(tLast, date) >= tMeter) {
    tLast = date;
    pLast = pActual(power);
  }

  return pLast;
};
