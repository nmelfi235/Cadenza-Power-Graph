import BuildingPowerTools from "./components/BuildingPowerTools.jsx";
import BatteryPowerTools from "./components/BatteryPowerTools.jsx";
import "./index.css";
import EventsTable from "./components/EventsTable.jsx";
import StateOfCarbon from "./components/StateOfCarbon.jsx";

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
      <BatteryPowerTools
        className="card p-4 d-flex flex-column align-items-left"
        style={{ height: "auto", width: 1200, verticalAlign: "center" }}
      />
      <EventsTable
        className="card p-4 d-flex flex-column align-items-left"
        style={{ height: 400, width: 900, verticalAlign: "center" }}
      />
      {/* Note: The StateOfCarbon Graph needs to be connected to a backend that preprocesses the data from the NE ISO API */}
      <StateOfCarbon className="card p-4 d-flex flex-column align-items-left" />
    </div>
  );
}
