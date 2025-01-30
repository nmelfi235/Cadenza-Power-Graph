import { useDispatch, useSelector } from "react-redux";
import { setACLoadPower } from "../dataSlice";
import { useEffect } from "react";

export default function ACLoadSettings() {
  const dispatch = useDispatch();
  const acLoadPower = useSelector((state) => state.data.ACLoadPower);

  /*
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
  }, []);*/

  return (
    <div className="card form-row mx-2 my-1 px-3 py-2" style={{ width: 200 }}>
      <h4>AC Load Settings</h4>
      <label htmlFor="ac-load-power-input">AC Load Power:</label>
      <div className="input-group">
        {/*UPS Only*/}
        <input
          id="ac-load-power-input"
          placeholder={acLoadPower}
          type="number"
          step="any"
          onChange={(e) => {
            e.preventDefault();
            dispatch(setACLoadPower(+e.target.value));
          }}
          className="form-control"
          data-bs-toggle="tooltip"
          data-bs-placement="right"
          title="Power of connected load (kW)"
        />
        <div className="input-group-text">kW</div>
      </div>
    </div>
  );
}
