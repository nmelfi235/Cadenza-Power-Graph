import { useDispatch, useSelector } from "react-redux";
import { setBatterySetting } from "../dataSlice";
import { useEffect } from "react";

export default function BatterySettings() {
  const dispatch = useDispatch();
  const settings = useSelector((state) => state.data.batterySettings);

  // Enable bootstrap tooltips
  useEffect(() => {
    const tooltipTriggerList = document.querySelectorAll(
      '[data-bs-toggle="tooltip"]'
    );
    const tooltipList = [...tooltipTriggerList].map(
      (tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl)
    );
    return () => {
      tooltipList.map((t) => t.dispose());
    };
  }, []);

  return (
    <div className="card form-row my-1 px-3 py-2">
      <h4>BESS Settings</h4>
      <label htmlFor="max-sell-amps-input">MaxSellAmps:</label>
      <input
        id="max-sell-amps-input"
        placeholder={settings.maxSellAmps}
        type="number"
        onChange={(e) => {
          e.preventDefault();
          dispatch(
            setBatterySetting({
              property: "maxSellAmps",
              value: +e.target.value,
            })
          );
          console.log(settings);
        }}
        className="form-control"
        data-bs-toggle="tooltip"
        data-bs-placement="right"
        title="Maximum battery current (A)"
      ></input>
      <label htmlFor="max-amp-hours-input">MaxAmpHours:</label>
      <input
        id="max-amp-hours-input"
        placeholder={settings.maxAmpHours}
        type="number"
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
      ></input>
      <label htmlFor="initial-soc-input">Starting SOC:</label>
      <input
        id="initial-soc-input"
        placeholder={settings.initialSOC}
        type="number"
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
      ></input>
    </div>
  );
}
