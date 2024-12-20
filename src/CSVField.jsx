import { useDispatch } from "react-redux";
import { setData } from "./dataSlice";
import { parse } from "papaparse";

// This component is the form where the .csv file will be inputthen parsed and sent to the redux store for use in other components.
export default function CSVField() {
  const dispatch = useDispatch();

  const handleChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      let power = [];
      reader.onload = (e) => {
        const content = e.target.result;
        const parsedContent = parse(content).data;
        console.log(parsedContent);
        parsedContent.pop();
        parsedContent.shift();
        const parsedPower = parsedContent.map((datum) => {
          return { date: datum[0], power: datum[1] ? +datum[1] : NaN };
        });
        console.log(parsedPower);
        //parsedPower.shift();
        //parsedPower.pop();
        dispatch(setData(parsedPower));
      };
      reader.readAsText(file);
    }
  };

  return (
    <form>
      <input type="file" onChange={handleChange} />
    </form>
  );
}
