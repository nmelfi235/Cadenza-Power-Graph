import { useDispatch, useSelector } from "react-redux";
import { setArbitrageProperty, setDPSProperty } from "../../dataSlice";
import { useEffect } from "react";

export default function ArbitrageSettings() {
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
      <h4>Arbitrage Settings</h4>
      <label htmlFor="start-of-discharge-input">Discharge Start: </label>
      <div className="input-group">
        <input
          id="start-of-discharge-input"
          type="number"
          step="any"
          placeholder={useSelector(
            (state) => state.data.Arbitrage.startOfDischarge
          )}
          onChange={(e) => {
            e.preventDefault();
            dispatch(
              setArbitrageProperty({
                property: "startOfDischarge",
                value: e.target.value,
              })
            );
          }}
          className="form-control"
          data-bs-toggle="tooltip"
          data-bs-placement="right"
          title="Start time for total discharge (24h)"
        />
        <div className="input-group-text">:00</div>
      </div>
      <label htmlFor="end-of-discharge-input">Discharge End: </label>
      <div className="input-group">
        <input
          id="end-of-discharge-input"
          type="number"
          step="any"
          placeholder={useSelector(
            (state) => state.data.Arbitrage.endOfDischarge
          )}
          onChange={(e) => {
            e.preventDefault();
            dispatch(
              setArbitrageProperty({
                property: "endOfDischarge",
                value: e.target.value,
              })
            );
          }}
          className="form-control"
          data-bs-toggle="tooltip"
          data-bs-placement="right"
          title="End time for total discharge (24h)"
        />
        <div className="input-group-text">:00</div>
      </div>
      <label htmlFor="usable-energy-input">Usable Energy:</label>
      <div className="input-group">
        <input
          id="usable-energy-input"
          placeholder={useSelector(
            (state) => state.data.Arbitrage.usableEnergy
          )}
          type="number"
          step="any"
          onChange={(e) => {
            e.preventDefault();
            dispatch(
              setArbitrageProperty({
                property: "usableEnergy",
                value: +e.target.value,
              })
            );
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
