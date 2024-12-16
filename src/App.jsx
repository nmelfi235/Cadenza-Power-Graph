import LinePlot from "./LinePlot";
import CSVField from "./CSVField";
import { useSelector } from "react-redux";
import "./index.css";

export default function App() {
  const data = useSelector((state) => state.data.formData);
  return (
    <div id="app">
      <CSVField />
      <LinePlot data={data} />
    </div>
  );
}
