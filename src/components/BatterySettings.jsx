import { useDispatch, useSelector } from "react-redux";
import { setBatterySetting } from "../dataSlice";

export default function BatterySettings() {
  const dispatch = useDispatch();
  const settings = useSelector((state) => state.data.batterySettings);

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
      ></input>
    </div>
  );
}
