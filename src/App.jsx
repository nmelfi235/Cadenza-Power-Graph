import BuildingPowerTools from "./components/BuildingPowerTools.jsx";
import BatteryPowerTools from "./components/BatteryPowerTools.jsx";
import "./index.css";
import EventsTable from "./components/EventsTable.jsx";

export default function App() {
  return (
    <div id="app" className="align-content-center">
      <BuildingPowerTools
        className="card p-4 d-flex flex-column align-items-left"
        style={{ height: 900, width: 1100, verticalAlign: "center" }}
      />
      <div className="d-flex flex-row" style={{ height: 400, width: 2200 }}>
        <BatteryPowerTools
          className="card p-4 d-flex flex-column align-items-left"
          style={{ height: 900, width: 1100, verticalAlign: "center" }}
        />
        <EventsTable
          className="card p-4 d-flex flex-column align-items-left"
          style={{ height: 400, width: 900, verticalAlign: "center" }}
        />
      </div>
    </div>
  );
}
