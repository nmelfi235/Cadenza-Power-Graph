import { useDispatch, useSelector } from "react-redux";
import { setBatteryProfile } from "../dataSlice.js";
import { parse } from "papaparse";
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { useRef, useEffect, useState } from "react";
import DownloadButton from "./DownloadButton";
import { tickFormat } from "../app/Helpers";

/*
TODO:
  - 
*/

// This component is the form where the .csv file will be inputthen parsed and sent to the redux store for use in other components.
function CSVField() {
  const dispatch = useDispatch();
  const startDate = useSelector((state) => state.data.buildingPower[0].date);

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
            +new Date(datum[0]) -
              +new Date(parsedContent[0][0]) +
              +new Date(startDate) +
              +new Date(1000 * 60 * 60 * 5)
          ).toString();
          const voltage = +datum[1] ? +datum[1] : NaN;
          const current = +datum[2] ? +datum[2] : +datum[2] === 0 ? 0 : NaN;
          return {
            date: date,
            voltage: voltage,
            current: current,
          };
        });
        dispatch(setBatteryProfile(parsedPower));
      };
      reader.readAsText(file);
    }
  };

  return (
    <form>
      <input type="file" className="form-control" onChange={handleChange} />
    </form>
  );
}

// This component generates a line plot. Modified D3 sample line plot for react.
function LinePlot({
  data,
  width = 1000,
  height = 500,
  marginTop = 20,
  marginRight = 30,
  marginBottom = 30,
  marginLeft = 30,
}) {
  // X Scale declaration (Domain is start thru end date, range is physical screen space)
  const x = d3.scaleTime(
    d3.extent(data, (d) => Date.parse(d.date)),
    [marginLeft, width - marginRight]
  );

  // Y Scale declaration (Domain is min to max voltage, range is physical screen space)
  const voltageY = d3.scaleLinear(
    [47, 54], //[d3.min(data, (d) => d.voltage), d3.max(data, (d) => d.voltage)],
    [height - marginBottom, marginTop]
  );

  const currentY = d3.scaleLinear(
    [
      -d3.max(data, (d) => d.current) * 1.1,
      d3.max(data, (d) => d.current) * 1.1,
    ], //[d3.min(data, (d) => d.current), d3.max(data, (d) => d.current)],
    [height - marginBottom, marginTop]
  );
  const tooltip = useRef(d3.create("g"));
  const bisect = d3.bisector((d) => new Date(d.date)).center; // function that gets the
  const pointerMoved = (e) => {
    const i = bisect(data, x.invert(d3.pointer(e)[0]));

    void d3
      .select(tooltip.current)
      .style("display", null)
      .attr(
        "transform",
        `translate(${x(new Date(data[i].date))},${voltageY(data[i].voltage)})`
      );

    const path = d3
      .select(tooltip.current)
      .selectAll("path")
      .data([,])
      .join("path")
      .attr("fill", "white")
      .attr("stroke", "black");

    const text = d3
      .select(tooltip.current)
      .selectAll("text")
      .data([,])
      .join("text")
      .call((text) =>
        text
          .selectAll("tspan")
          .data(
            Object.keys(data[0]).map(
              (d) =>
                `${d}: ${
                  d === "date"
                    ? d3.timeFormat("%a %d %I:%M %p")(new Date(data[i][d]))
                    : d === "voltage"
                    ? d3.format(".2f")(data[i][d]) + " V"
                    : d3.format(".2f")(data[i][d]) + " A"
                }`
            )
          )
          .join("tspan")
          .attr("class", "tooltip-label")
          .attr("x", 0)
          .attr("y", (d, i) => `${i * 1.1}em`)
          .attr("font-weight", (d, i) => (i ? null : "bold"))
          .text((d) => d)
      );

    size(text, path);
  };

  function pointerLeft() {
    d3.select(tooltip.current).style("display", "none");
  }

  function size(text, path) {
    const { x, y, width: w, height: h } = text.node().getBBox();
    text.attr("transform", `translate(${-w / 2},${15 - y})`);
    path.attr(
      "d",
      `M${-w / 2 - 10},5H-5l5,-5l5,5H${w / 2 + 10}v${h + 20}h-${w + 20}z`
    );
  }

  // Line generator (Draws line only showing points that are not missing, hiding the missing points)
  const voltageLine = d3
    .line()
    .defined((d) => !isNaN(d.voltage))
    .x((d) => x(Date.parse(d.date)))
    .y((d) => voltageY(d.voltage));

  const currentLine = d3
    .line()
    .defined((d) => !isNaN(d.current))
    .x((d) => x(Date.parse(d.date)))
    .y((d) => currentY(d.current));

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
            .tickFormat(tickFormat)
            .tickSizeOuter(0)
        )
        .call((g) =>
          g
            .selectAll(".tick line")
            .attr("y2", -height + marginTop + marginBottom)
            .attr("stroke-opacity", 0.1)
            .attr("stroke-dasharray", [8, 10])
        ),
    [data, xAxis, x]
  );

  // Add the y-axis to the container.
  const voltageYAxis = useRef(d3.create("g"));
  useEffect(
    () =>
      void d3
        .select(voltageYAxis.current)
        .attr("transform", `translate(${marginLeft}, 0)`)
        .call(d3.axisLeft(voltageY).ticks(height / 40, ".1f"))
        .call((g) => g.select(".domain").remove())
        .call((g) =>
          g
            .selectAll(".tick line")
            .attr("x2", width - marginLeft - marginRight)
            .attr("stroke-opacity", 0.1)
        )
        .call((g) =>
          g
            .select("text")
            .attr("x", -marginLeft)
            .attr("y", -height + marginTop + 15)
            .attr("fill", "currentColor")
            .attr("text-anchor", "start")
            .text("Voltage (V)")
        ),
    [data, voltageYAxis, voltageY]
  );

  const voltageMissingLine = useRef(d3.create("path"));
  useEffect(
    () =>
      void d3
        .select(voltageMissingLine.current)
        .attr("fill", "none")
        .attr("stroke", "#ccc")
        .attr("stroke-width", 1.5)
        .attr("stroke-dasharray", [10, 8])
        .attr("d", voltageLine(data.filter((d) => !isNaN(d.voltage)))),
    [data, voltageMissingLine, voltageLine]
  );

  const voltageRealLine = useRef(d3.create("path"));
  useEffect(
    () =>
      void d3
        .select(voltageRealLine.current)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", voltageLine(data)),
    [data, voltageRealLine, voltageLine]
  );

  const currentYAxis = useRef(d3.create("g"));
  useEffect(
    () =>
      void d3
        .select(currentYAxis.current)
        .attr("transform", `translate(${width - marginRight}, 0)`)
        .call(d3.axisRight(currentY).ticks(height / 40, ".1f"))
        .call((g) => g.select(".domain").remove())
        .call((g) =>
          g.selectAll(".tick line").clone().attr("stroke-opacity", 0.1)
        )
        .select("text")
        .attr("x", -marginLeft)
        .attr("y", -height + marginTop + marginBottom + 10)
        .attr("fill", "currentColor")
        .attr("text-anchor", "start")
        .text("Current (A)"),
    [data, currentYAxis, currentY]
  );

  const currentMissingLine = useRef(d3.create("path"));
  useEffect(
    () =>
      void d3
        .select(currentMissingLine.current)
        .attr("fill", "none")
        .attr("stroke", "#ccc")
        .attr("stroke-width", 1.5)
        .attr("stroke-dasharray", [10, 8])
        .attr("d", currentLine(data.filter((d) => !isNaN(d.current)))),
    [data, currentMissingLine, currentLine]
  );

  const currentRealLine = useRef(d3.create("path"));
  useEffect(
    () =>
      void d3
        .select(currentRealLine.current)
        .attr("fill", "none")
        .attr("stroke", "green")
        .attr("stroke-width", 1.5)
        .attr("d", currentLine(data)),
    [data, currentRealLine, currentLine]
  );

  const zoomFunction = (e) => {};

  const svgRef = useRef(null);
  d3.select(svgRef.current)
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr(
      "viewBox",
      `0 0 ${width + marginLeft + marginRight} ${
        height + marginBottom + marginTop
      }`
    )
    .on("pointerenter pointermove", pointerMoved)
    .on("pointerleave", pointerLeft);

  return (
    <svg ref={svgRef}>
      <g ref={xAxis} />
      <g ref={voltageYAxis} />
      <g ref={currentYAxis} />
      <g>
        <path ref={voltageMissingLine} />
        <path ref={voltageRealLine} />
      </g>
      <g>
        <path ref={currentMissingLine} />
        <path ref={currentRealLine} />
      </g>
      <g ref={tooltip} />
    </svg>
  );
}

export default function BatteryPowerTools({ className, style }) {
  const data = useSelector((state) => state.data.batteryProfile);

  return (
    <div className={className} style={style}>
      <h2>Battery Power</h2>
      <CSVField />
      {data.length > 0 ? (
        <>
          <LinePlot data={data} />
          <DownloadButton
            chartData="batteryProfile"
            fileName="Battery_Profile.csv"
          />
        </>
      ) : (
        <></>
      )}
    </div>
  );
}
