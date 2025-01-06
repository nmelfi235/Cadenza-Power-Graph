import { useDispatch, useSelector } from "react-redux";
import { setBuildingData } from "../dataSlice";
import { parse } from "papaparse";
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { useRef, useEffect, useState } from "react";
import "../app/Calculations";
import { pActual, pBuilding, pBESS, pMeter } from "../app/Calculations";

// This component is the form where the .csv file will be inputthen parsed and sent to the redux store for use in other components.
function CSVField({ setFunction }) {
  const dispatch = useDispatch();
  const batteryProfile = useSelector((state) => state.data.batteryProfile);

  const handleChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        const parsedContent = parse(content).data;
        console.log(parsedContent);
        parsedContent.pop();
        parsedContent.shift();
        const parsedPower = parsedContent.map((datum) => {
          const date = new Date(
            new Date(datum[0]) - new Date(parsedContent[0][0])
          ).toString();
          const power = +datum[1] ? +datum[1] : NaN;
          return {
            date: date,
            pActual: pActual(power),
            pBuilding: pBuilding(date, power, batteryProfile),
            pBESS: pBESS(date, batteryProfile),
            pMeter: pMeter(date, power),
          };
        });
        console.log(parsedPower);
        setFunction(parsedPower);
        dispatch(setBuildingData(parsedPower));
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

// This component generates a line plot. Modified D3 sample line plot for react.
function LinePlot({
  data,
  width = 1000,
  height = 500,
  marginTop = 50,
  marginRight = 50,
  marginBottom = 50,
  marginLeft = 50,
}) {
  // X Scale declaration (Domain is start thru end date, range is physical screen space)
  const x = d3.scaleTime(
    d3.extent(data, (d) => Date.parse(d.date)),
    [marginLeft, width - marginRight]
  );

  // Y Scale declaration (Domain is min to max power, range is physical screen space)
  const y = d3.scaleLinear(
    [
      d3.min(data, (d) => {
        let valsList = [];
        for (const property in d) {
          if (property !== "date") valsList.push(d[property]);
        }
        return d3.min(valsList);
      }),
      d3.max(data, (d) => {
        let valsList = [];
        for (const property in d) {
          if (property !== "date") valsList.push(d[property]);
        }
        return d3.max(valsList);
      }),
    ],
    [height - marginBottom, marginTop]
  );

  // Add the x-axis to the container.
  const xAxis = useRef(d3.create("g"));
  useEffect(
    () =>
      void d3
        .select(xAxis.current)
        .attr("transform", `translate(0, ${height - marginBottom})`)
        .call(
          d3
            .axisBottom(x)
            .ticks(width / 80)
            .tickSizeOuter(0)
        )
        .call((g) =>
          g
            .selectAll(".tick line")
            .clone()
            .attr("y2", -height + marginTop + marginBottom)
            .attr("stroke-opacity", 0.1)
            .attr("stroke-dasharray", [8, 10])
        ),
    [xAxis, x]
  );

  // Add the y-axis to the container.
  const yAxis = useRef(d3.create("g"));
  useEffect(
    () =>
      void d3
        .select(yAxis.current)
        .attr("transform", `translate(${marginLeft}, 0)`)
        .call(d3.axisLeft(y).ticks(height / 40))
        .call((g) => g.select(".domain").remove())
        .call((g) =>
          g
            .selectAll(".tick line")
            .clone()
            .attr("x2", width - marginLeft - marginRight)
            .attr("stroke-opacity", 0.1)
        )
        .call((g) =>
          g
            .append("text")
            .attr("x", -marginLeft)
            .attr("y", 10)
            .attr("fill", "currentColor")
            .attr("text-anchor", "start")
            .text("Power (kW)")
        ),
    [yAxis, y]
  );

  const drawLine = (property, color, missingRef, realRef) => {
    // Line generator (Draws line only showing points that are not missing, hiding the missing points)
    const line = d3
      .line()
      .defined((d) => !isNaN(d["pActual"]))
      .x((d) => x(Date.parse(d.date)))
      .y((d) => y(d[property]));

    useEffect(
      () =>
        void d3
          .select(missingRef.current)
          .attr("fill", "none")
          .attr("stroke", "#ccc")
          .attr("stroke-width", 1.5)
          .attr("stroke-dasharray", [10, 8])
          .attr("d", line(data.filter((d) => !isNaN(d[property])))),
      [missingRef, line]
    );

    useEffect(
      () =>
        void d3
          .select(realRef.current)
          .attr("fill", "none")
          .attr("stroke", color)
          .attr("stroke-width", 1.5)
          .attr("d", line(data)),
      [realRef, line]
    );
  };
  const missingPActual = useRef(d3.create("path"));
  const realPActual = useRef(d3.create("path"));
  drawLine("pActual", "blue", missingPActual, realPActual);

  const missingPBESS = useRef(d3.create("path"));
  const realPBESS = useRef(d3.create("path"));
  drawLine("pBESS", "black", missingPBESS, realPBESS);

  const missingPBuilding = useRef(d3.create("path"));
  const realPBuilding = useRef(d3.create("path"));
  drawLine("pBuilding", "purple", missingPBuilding, realPBuilding);

  const missingPMeter = useRef(d3.create("path"));
  const realPMeter = useRef(d3.create("path"));
  drawLine("pMeter", "red", missingPMeter, realPMeter);

  const zoomFunction = (e) => {};

  return (
    <svg preserveAspectRatio="xMinYMin meet" viewBox={`0 0 ${width} ${height}`}>
      <g ref={xAxis} />
      <g ref={yAxis} />
      <g>
        <path ref={missingPActual} />
        <path ref={realPActual} />
        <path ref={missingPBESS} />
        <path ref={realPBESS} />
        <path ref={missingPBuilding} />
        <path ref={realPBuilding} />
        <path ref={missingPMeter} />
        <path ref={realPMeter} />
      </g>
      <g></g>
    </svg>
  );
}

export default function BuildingPowerTools({ className, style }) {
  const [data, setData] = useState([
    { date: "01-01-1971", pActual: 1, pBuilding: 2, pBESS: 3, pMeter: 4 },
    { date: "01-02-1971", pActual: 1, pBuilding: 2, pBESS: 3, pMeter: 4 },
  ]);

  return (
    <div className={className} style={style}>
      <h2>Building Power</h2>
      <CSVField setFunction={setData} />
      <LinePlot data={data} />
    </div>
  );
}
