import { useDispatch, useSelector } from "react-redux";
import { setBatterySetting } from "../dataSlice";
import { useEffect } from "react";

export default function BatterySettings() {
  const dispatch = useDispatch();
  const settings = useSelector((state) => state.data.batterySettings);

  return (
    <div className="card form-row mx-2 my-1 px-3 py-2" style={{ width: 200 }}>
      <h4>BESS Settings</h4>
      <label htmlFor="charge-capacity-input">Max Charge Power:</label>
      <div className="input-group">
        <input
          id="charge-capacity-input"
          placeholder={settings.maxChargePower}
          type="number"
          step="any"
          onChange={(e) => {
            e.preventDefault();
            dispatch(
              setBatterySetting({
                property: "maxChargePower",
                value: +e.target.value,
              })
            );
            console.log(settings);
          }}
          className="form-control"
          data-bs-toggle="tooltip"
          data-bs-placement="right"
          title="Maximum charge power (kW)"
        />
        <div className="input-group-text">kW</div>
      </div>
      <label htmlFor="discharge-capacity-input">Max Discharge Power:</label>
      <div className="input-group">
        <input
          id="discharge-capacity-input"
          placeholder={settings.maxDischargePower}
          type="number"
          step="any"
          onChange={(e) => {
            e.preventDefault();
            dispatch(
              setBatterySetting({
                property: "maxDischargePower",
                value: +e.target.value,
              })
            );
            console.log(settings);
          }}
          className="form-control"
          data-bs-toggle="tooltip"
          data-bs-placement="right"
          title="Maximum discharge power (kW)"
        />
        <div className="input-group-text">kW</div>
      </div>
      <label htmlFor="max-amp-hours-input">Capacity:</label>
      <div className="input-group">
        <input
          id="max-amp-hours-input"
          placeholder={settings.maxAmpHours}
          type="number"
          step="any"
          onChange={(e) => {
            e.preventDefault();
            dispatch(
              setBatterySetting({
                property: "maxAmpHours",
                value: +e.target.value,
              })
            );
            console.log(settings);
          }}
          className="form-control"
          data-bs-toggle="tooltip"
          data-bs-placement="right"
          title="Battery capacity (Ah)"
        />
        <div className="input-group-text">Ah</div>
      </div>
      <label htmlFor="initial-soc-input">Starting SOC:</label>
      <div className="input-group">
        <input
          id="initial-soc-input"
          placeholder={settings.initialSOC}
          type="number"
          step="any"
          onChange={(e) => {
            e.preventDefault();
            dispatch(
              setBatterySetting({
                property: "initialSOC",
                value: +e.target.value,
              })
            );
            console.log(settings);
          }}
          className="form-control"
          data-bs-toggle="tooltip"
          data-bs-placement="right"
          title="State of Charge (%)"
        />
        <div className="input-group-text">%</div>
      </div>
      <label htmlFor="soh-input">State of Health:</label>
      <div className="input-group">
        <input
          id="soh-input"
          placeholder={settings.stateOfHealth}
          type="number"
          step="any"
          onChange={(e) => {
            e.preventDefault();
            dispatch(
              setBatterySetting({
                property: "stateOfHealth",
                value: +e.target.value,
              })
            );
            console.log(settings);
          }}
          className="form-control"
          data-bs-toggle="tooltip"
          data-bs-placement="right"
          title="State of Health (%)"
        />
        <div className="input-group-text">%</div>
      </div>
      <label htmlFor="usable-energy-input">Usable Energy:</label>
      <div className="input-group">
        <input
          id="usable-energy-input"
          placeholder={settings.usableEnergy}
          type="number"
          step="any"
          onChange={(e) => {
            e.preventDefault();
            dispatch(
              setBatterySetting({
                property: "usableEnergy",
                value: +e.target.value,
              })
            );
            console.log(settings);
          }}
          className="form-control"
          data-bs-toggle="tooltip"
          data-bs-placement="right"
          title="Percentage of Battery that is usable (%)"
        />
        <div className="input-group-text">%</div>
      </div>
    </div>
  );
}
