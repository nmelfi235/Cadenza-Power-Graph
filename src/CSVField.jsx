import { useDispatch } from "react-redux";
import { setData } from "./dataSlice";
import { parse } from "papaparse";

export default function CSVField() {
  const dispatch = useDispatch();

  const handleChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        const parsedContent = parse(content).data;
        const parsedPower = parsedContent.map((datum) =>
          +datum[2] ? +datum[2] : 0
        );
        console.log(parsedPower);
        dispatch(setData(parsedPower));
      };
      reader.readAsText(file);
    }
    //d3.csv(e.target.files).then((d) => console.log(d));
  };

  return (
    <form>
      <input type="file" onChange={handleChange} />
    </form>
  );
}
