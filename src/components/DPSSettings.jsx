import { useDispatch, useSelector } from "react-redux";
import { setDPSProperty } from "../dataSlice";
import { useEffect } from "react";

export default function DPSSettings({ setFunction }) {
  const dispatch = useDispatch();
  const data = useSelector((state) => state.data.buildingPower);

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
      <h4>DPS Settings</h4>
      <label htmlFor="goal-input">Goal: </label>
      <input
        id="goal-input"
        type="number"
        placeholder={useSelector((state) => state.data.DPS.pGoal)}
        onChange={(e) => {
          e.preventDefault();
          dispatch(
            setDPSProperty({ property: "pGoal", value: e.target.value })
          );
          setFunction(data);
        }}
        className="form-control"
        data-bs-toggle="tooltip"
        data-bs-placement="right"
        title="Desired Peak Power (kW)"
      />
      <label htmlFor="meter-scan-time-input">Meter Scan Time: </label>
      <input
        id="meter-scan-time-input"
        type="number"
        placeholder={useSelector((state) => state.data.DPS.meterScanTime)}
        onChange={(e) => {
          e.preventDefault();
          dispatch(
            setDPSProperty({ property: "meterScanTime", value: e.target.value })
          );
          setFunction(data);
        }}
        className="form-control"
        data-bs-toggle="tooltip"
        data-bs-placement="right"
        title="Power Meter Scan Time (m)"
      />
      <label htmlFor="dps-scan-time-input">DPS Scan Time: </label>
      <input
        id="dps-scan-time-input"
        type="number"
        placeholder={useSelector((state) => state.data.DPS.scanTime)}
        onChange={(e) => {
          e.preventDefault();
          dispatch(
            setDPSProperty({ property: "scanTime", value: e.target.value })
          );
          setFunction(data);
        }}
        className="form-control"
        data-bs-toggle="tooltip"
        data-bs-placement="right"
        title="Scheduled Event Duration (m)"
      />
    </div>
  );
}
