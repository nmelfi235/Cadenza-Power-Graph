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
    <div className="card form-row mx-2 my-1 px-3 py-2" style={{ width: 200 }}>
      <h4>DPS Settings</h4>
      <label htmlFor="goal-input">Goal: </label>
      <div className="input-group">
        <input
          id="goal-input"
          type="number"
          step="any"
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
        <div className="input-group-text">kW</div>
      </div>
      <label htmlFor="meter-scan-time-input">Meter Scan Time: </label>
      <div className="input-group">
        <input
          id="meter-scan-time-input"
          type="number"
          step="any"
          placeholder={useSelector((state) => state.data.DPS.meterScanTime)}
          onChange={(e) => {
            e.preventDefault();
            dispatch(
              setDPSProperty({
                property: "meterScanTime",
                value: e.target.value,
              })
            );
            setFunction(data);
          }}
          className="form-control"
          data-bs-toggle="tooltip"
          data-bs-placement="right"
          title="Power Meter Scan Time (min)"
        />
        <div className="input-group-text">min</div>
      </div>
      <label htmlFor="dps-scan-time-input">DPS Scan Time: </label>
      <div className="input-group">
        <input
          id="dps-scan-time-input"
          type="number"
          step="any"
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
        <div className="input-group-text">min</div>
      </div>
    </div>
  );
}
