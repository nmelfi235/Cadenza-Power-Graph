import { useDispatch, useSelector } from "react-redux";
import {
  resetBatteryProfile,
  resetBuildingData,
  setBatteryProfile,
  setBuildingData,
  setDPSProperty,
} from "../dataSlice.js";
import store from "../app/store.js";
import { parse } from "papaparse";
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { useRef, useEffect, useState } from "react";
import { pActual, pBuilding, pBESS, pMeter, pGoal } from "../app/Calculations";
import { tickFormat } from "../app/Helpers";
import DownloadButton from "./DownloadButton";
import DPSSettings from "./DPSSettings.jsx";
import Legend from "./Legend.jsx";
import BatterySettings from "./BatterySettings.jsx";
import ACLoadSettings from "./ACLoadSettings.jsx";

// This component is the form where the .csv file will be inputthen parsed and sent to the redux store for use in other components.
function CSVField() {
  const [file, setFile] = useState(null);
  const dispatch = useDispatch();
  const PGOAL = useSelector((state) => state.data.DPS.pGoal);

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
  }, [file]);

  const updateData = () => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const content = ev.target.result;
        const parsedContent = parse(content).data;
        parsedContent.pop();
        parsedContent.shift();

        const batteryStats = []; // contents are created in parsedPower mapping
        const parsedPower = parsedContent.map((datum) => {
          const date = new Date(
            +new Date(datum[0]) // + +new Date(1000 * 60 * 60 * 5) // timezone -5:00 GMT
          ).toString();
          const power = +datum[1] ? +datum[1] : NaN;
          batteryStats.push({
            date: date,
            voltage: store.getState().data.batteryState.batteryVoltage,
            current: store.getState().data.batteryState.batteryCurrent,
          });
          return {
            date: date,
            pActual: pActual(power),
            pBuilding: pBuilding(date, power),
            pBESS: pBESS(date, power),
            pMeter: pMeter(date, power),
            pGoal: pGoal(PGOAL),
            SOC: store.getState().data.batteryState.batterySOC,
          };
        });
        dispatch(setBuildingData(parsedPower));
        dispatch(setBatteryProfile(batteryStats));
      };
      reader.readAsText(file);
    }
  };

  useEffect(() => updateData(), [file]);

  const handleChange = (event) => {
    event.preventDefault();
    setFile(event.target.files[0]);
  };

  return (
    <form className="d-flex flex-row w-75 justify-content-center">
      <input
        type="file"
        onChange={handleChange}
        className="form-control w-50"
      />
      <input
        type="reset"
        className="btn btn-danger mx-2"
        data-bs-toggle="tooltip"
        data-bs-placement="right"
        title="Click to reset data"
        onClick={(e) => setFile(null)}
      />
      <button
        className="btn btn-primary"
        data-bs-toggle="tooltip"
        data-bs-placement="right"
        title="Click to regenerate graph"
        onClick={(e) => {
          e.preventDefault();
          updateData();
        }}
      >
        Generate
      </button>
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
  colors,
}) {
  d3.select("#power-graph").selectAll("g").remove();
  const svgRef = useRef(d3.create("svg"));
  useEffect(() => {
    d3.select(svgRef.current)
      .attr("id", "power-graph")
      .attr("preserveAspectRatio", "xMinYMin meet")
      .attr(
        "viewBox",
        `0 0 ${width + marginLeft + marginRight} ${
          height + marginBottom + marginTop
        }`
      )
      .on("pointerenter pointermove", pointerMoved)
      .on("pointerleave", pointerLeft);
  }, [data, svgRef]);

  // X Scale declaration (Domain is start thru end date, range is physical screen space)
  const x = d3.scaleTime(
    d3.extent(data, (d) => Date.parse(d.date)),
    [marginLeft, width - marginRight]
  );

  // Y Scale declaration (Domain is min to max power, range is physical screen space)
  const valsList = data.flatMap((d) => [
    ...Object.keys(d)
      .filter((k) => k !== "date" && k !== "SOC")
      .map((k) => d[k]),
  ]);
  const y = d3.scaleLinear(
    [d3.min(valsList), d3.max(valsList)],
    [height - marginBottom, marginTop]
  );

  const socY = d3.scaleLinear([0, 100], [height - marginBottom, marginTop]);

  // Add the x-axis to the container.
  useEffect(
    () =>
      void d3
        .select(svgRef.current)
        .append("g")
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
    [data, svgRef, x]
  );

  // Add the y-axis to the container.
  useEffect(
    () =>
      void d3
        .select(svgRef.current)
        .append("g")
        .attr("transform", `translate(${marginLeft}, 0)`)
        .call(d3.axisLeft(y).ticks(height / 40, ".1f"))
        .call((g) => g.select(".domain").remove())
        .call((g) =>
          g
            .selectAll(".tick line")
            .attr("x2", width - marginLeft - marginRight)
            .attr("stroke-opacity", 0.1)
        )
        .select("text")
        .attr("x", -marginLeft)
        .attr("y", -height + marginBottom + 10)
        .attr("fill", "currentColor")
        .attr("text-anchor", "start")
        .text("Power (kW)"),
    [data, svgRef, y]
  );

  useEffect(() => {
    void d3
      .select(svgRef.current)
      .append("g")
      .attr("transform", `translate(${width - marginRight}, 0)`)
      .call(d3.axisRight(socY).ticks(height / 40, ".1f"))
      .call((g) => g.select(".domain").remove())
      .select("text")
      .attr("x", -marginLeft)
      .attr("y", -height + marginBottom + 10)
      .attr("fill", "currentColor")
      .attr("text-anchor", "start")
      .text("SOC (%)");
  }, [data, svgRef, y]);

  const bisect = d3.bisector((d) => new Date(d.date)).center; // function that gets the
  const pointerMoved = (e) => {
    d3.select("#tooltip").remove();
    const i = bisect(data, x.invert(d3.pointer(e)[0]));

    const tooltip = d3
      .select(svgRef.current)
      .append("g")
      .style("display", null)
      .attr(
        "transform",
        `translate(${d3.pointer(e)[0]},${d3.pointer(e)[1] + 15})`
      )
      .attr("id", "tooltip");

    const path = tooltip
      .selectAll("path")
      .data([,])
      .join("path")
      .attr("fill", "white")
      .attr("stroke", "black");

    const text = tooltip
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
                    ? d3.timeFormat("%a %B %d %I:%M %p")(new Date(data[i][d]))
                    : d === "SOC"
                    ? d3.format(".1f")(data[i][d]) + "%"
                    : d3.format(".2f")(data[i][d]) + " kW"
                }`
            )
          )
          .join("tspan")
          .attr("class", (d) => "tooltip-label " + d.match(/\w+/))
          .attr("x", 0)
          .attr("y", (d, i) => `${i * 1.1}em`)
          .attr("font-weight", (d, i) => (i ? null : "bold"))
          .text((d) => d)
      );

    size(text, path);
    d3.select("#tooltip").exit().remove();
  };

  function pointerLeft() {
    d3.select("#tooltip").style("display", "none");
  }

  function size(text, path) {
    const { x, y, width: w, height: h } = text.node().getBBox();
    text.attr("transform", `translate(${-w / 2},${15 - y})`);
    path.attr(
      "d",
      `M${-w / 2 - 10},5H-5l5,-5l5,5H${w / 2 + 10}v${h + 20}h-${w + 20}z`
    );
  }

  const drawLine = (property) => {
    const lines = d3.select(svgRef.current).append("g");
    // Line generator (Draws line only showing points that are not missing, hiding the missing points)
    const line = d3
      .line()
      .defined((d) => !isNaN(d["pActual"]))
      .x((d) => x(Date.parse(d.date)))
      .y((d) => y(d[property]));

    lines
      .append("path")
      .attr("class", property)
      .attr("fill", "none")
      .attr("stroke", "#ccc")
      .attr("stroke-width", 1.5)
      .attr("stroke-dasharray", [10, 8])
      .attr("d", line(data.filter((d) => !isNaN(d[property]))));

    lines
      .append("path")
      .attr("class", property)
      .attr("fill", "none")
      .attr("stroke", colors[property ? property : 0])
      .attr("stroke-width", 1.5)
      .attr("d", line(data));
  };

  useEffect(() => {
    // Percentage axis
    const line = d3
      .line()
      .defined((d) => !isNaN(d["pActual"]))
      .x((d) => x(Date.parse(d.date)))
      .y((d) => socY(d["SOC"]));

    d3.select("#SOCLine").remove();
    d3.select(svgRef.current)
      .append("path")
      .attr("class", "SOC")
      .attr("fill", "none")
      .attr("stroke", colors["SOC"])
      .attr("stroke-width", 1.5)
      .attr("d", line(data))
      .attr("id", "SOCLine");

    // Power axis
    for (const key in data[0]) if (key !== "date") drawLine(key);
  }, [data, svgRef]);

  d3.select(svgRef.current).exit().remove();

  return <svg ref={svgRef} />;
}

export default function BuildingPowerTools({ className, style }) {
  const data = useSelector((state) => state.data.buildingPower);
  const colors = {
    pActual: "lightgreen",
    pBESS: "darkblue",
    pBuilding: "purple",
    pMeter: "red",
    pGoal: "orange",
    SOC: "#08f",
  };

  return (
    <div className={className} style={style}>
      <div
        className="d-flex flex-column align-items-center"
        data-section
        style={{ "--section-num": 1 }}
      >
        <p className="lead">Step 1: Adjust settings as needed.</p>
        <div className="d-flex flex-row justify-content-center">
          <DPSSettings />
          <BatterySettings />
          <ACLoadSettings />
        </div>
      </div>
      <div
        className="d-flex flex-column align-items-center border-top my-2"
        data-section
        style={{ "--section-num": 2 }}
      >
        <p className="lead my-2">
          Step 2: Upload a csv file with the date and building power.
        </p>
        <CSVField />
      </div>
      {data.length > 0 ? (
        <>
          <div
            className="d-flex flex-column w-100 h-50 align-items-center border-top my-2"
            data-section
            style={{ "--section-num": 3 }}
          >
            <h2 className="display-6 my-2">Building Power</h2>
            <LinePlot data={data} colors={colors} />
            <Legend data={data} colors={colors} />
          </div>
          <div
            className="d-flex flex-column align-items-center border-top my-2"
            data-section
            style={{ "--section-num": 4 }}
          >
            <p className="lead my-2">Step 3: Download your projected data.</p>
            <DownloadButton chartData="buildingPower" fileName="DPS_Data.csv" />
          </div>
        </>
      ) : (
        <></>
      )}
    </div>
  );
}
