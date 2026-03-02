import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { setTariff } from "../../dataSlice";
import tariffs from "../../assets/tariffs.json" with { type: "json" };

export default function PeakSettings() {
  const [selectedTariff, setSelectedTariff] = useState("");
  const dispatch = useDispatch();

  // Enable bootstrap tooltips
  useEffect(() => {
    const tooltipTriggerList = document.querySelectorAll(
      '[data-bs-toggle="tooltip"]',
    );
    const tooltipList = [...tooltipTriggerList].map(
      (tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl),
    );
    return () => {
      tooltipList.map((t) => t.dispose());
    };
  }, []);

  const handleTariffChange = (e) => {
    e.preventDefault();
    setSelectedTariff(e.target.value);
    const t = tariffs[e.target.value];
    dispatch(setTariff(t));
  };

  return (
    <div className="card form-row mx-2 my-1 px-3 py-2" style={{ width: 200 }}>
      <h4>Tariff Settings</h4>
      <label htmlFor="tariff-input">Tariff:</label>
      <select
        id="tariff-input"
        className="form-control"
        value={selectedTariff}
        onChange={handleTariffChange}
      >
        {Object.keys(tariffs).map((key, value) => (
          <option key={key} value={key}>
            {key}
          </option>
        ))}
      </select>
      <label htmlFor="start-of-peak-input">On-Peak Start: </label>
      <div className="input-group">
        <input
          id="start-of-peak-input"
          type="number"
          step="any"
          placeholder={useSelector(
            (state) => state.data.currentTariff.peakPeriodStart,
          )}
          onChange={(e) => {
            e.preventDefault();
            dispatch(
              setPeakSettingsProperty({
                property: "peakPeriodStart",
                value: e.target.value,
              }),
            );
          }}
          className="form-control"
          data-bs-toggle="tooltip"
          data-bs-placement="right"
          title="Start time for on-peak hours (24h)"
          readOnly
        />
        <div className="input-group-text">:00</div>
      </div>
      <label htmlFor="end-of-peak-input">On-Peak End: </label>
      <div className="input-group">
        <input
          id="end-of-discharge-input"
          type="number"
          step="any"
          placeholder={useSelector(
            (state) => state.data.currentTariff.peakPeriodEnd,
          )}
          onChange={(e) => {
            e.preventDefault();
            dispatch(
              setPeakSettingsProperty({
                property: "peakPeriodEnd",
                value: e.target.value,
              }),
            );
          }}
          className="form-control"
          data-bs-toggle="tooltip"
          data-bs-placement="right"
          title="End time for on-peak hours(24h)"
          readOnly
        />
        <div className="input-group-text">:00</div>
      </div>
    </div>
  );
}
