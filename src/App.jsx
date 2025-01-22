import BuildingPowerTools from "./components/BuildingPowerTools.jsx";
import BatteryPowerTools from "./components/BatteryPowerTools.jsx";
import "./index.css";
import EventsTable from "./components/EventsTable.jsx";

export default function App() {
  return (
    <div
      id="app"
      className="d-flex flex-column justify-content-center align-items-center"
    >
      <BuildingPowerTools
        className="p-4 d-flex flex-column align-items-left"
        style={{ height: "auto", width: 1200, verticalAlign: "center" }}
      />
      <div className="d-flex flex-row">
        <BatteryPowerTools
          className="card p-4 d-flex flex-column align-items-left"
          style={{ height: "auto", width: 1200, verticalAlign: "center" }}
        />
        {/*
        <EventsTable
          className="card p-4 d-flex flex-column align-items-left"
          style={{ height: 400, width: 900, verticalAlign: "center" }}
        />*/}
      </div>
    </div>
  );
}
