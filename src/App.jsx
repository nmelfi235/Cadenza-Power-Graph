import BuildingPowerTools from "./components/BuildingPowerTools";
import { useSelector } from "react-redux";
import "./index.css";
import BatteryPowerTools from "./components/BatteryPowerTools.jsx";

export default function App() {
  const buildingData = useSelector((state) => state.data.buildingPower);
  const batteryData = useSelector((state) => state.data.batteryProfile);
  return (
    <div id="app" className="align-content-center">
      <BatteryPowerTools
        className="card p-4 d-flex flex-column align-items-left"
        style={{ height: 500, width: 800, verticalAlign: "center" }}
      />
      <BuildingPowerTools
        className="card p-4 d-flex flex-column align-items-left"
        style={{ height: 500, width: 800, verticalAlign: "center" }}
      />
    </div>
  );
}
