import { useDispatch, useSelector } from "react-redux";
import {
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

function DPSSettings({ setFunction }) {
  const dispatch = useDispatch();
  const data = useSelector((state) => state.data.buildingPower);
  return (
    <div className="form-row mt-1">
      <label htmlFor="goal-input">Goal: </label>
      <input
        id="goal-input"
        type="number"
        placeholder={useSelector((state) => state.data.DPS.pGoal)}
        onChange={(e) => {
          e.preventDefault();
          dispatch(
            setDPSProperty({ property: "pGoal", value: e.target.value })
          );
          setFunction(data);
          console.log(data);
        }}
        className="form-control"
      />
      <label htmlFor="meter-scan-time-input">Meter Scan Time: </label>
      <input
        id="meter-scan-time-input"
        type="number"
        placeholder={useSelector((state) => state.data.DPS.meterScanTime)}
        onChange={(e) => {
          e.preventDefault();
          dispatch(
            setDPSProperty({ property: "meterScanTime", value: e.target.value })
          );
          setFunction(data);
          console.log(e.target.value);
        }}
        className="form-control"
      />
    </div>
  );
}

// This component is the form where the .csv file will be inputthen parsed and sent to the redux store for use in other components.
function CSVField({ setFunction }) {
  const dispatch = useDispatch();
  const PGOAL = useSelector((state) => state.data.DPS.pGoal);

  const handleChange = (event) => {
    event.preventDefault();
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        const parsedContent = parse(content).data;
        parsedContent.pop();
        parsedContent.shift();

        const batteryStats = []; // contents are created in parsedPower mapping

        const parsedPower = parsedContent.map((datum) => {
          const date = new Date(
            +new Date(datum[0]) + +new Date(1000 * 60 * 60 * 5) // timezone -5:00 GMT
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
        setFunction(parsedPower);
        dispatch(setBuildingData(parsedPower));
        dispatch(setBatteryProfile(batteryStats));
      };
      reader.readAsText(file);
    }
  };

  return (
    <form className="d-flex">
      <input
        type="file"
        onChange={handleChange}
        className="form-control w-50"
      />
      <input type="reset" className="btn btn-primary mx-2" />
    </form>
  );
}

// This component generates a line plot. Modified D3 sample line plot for react.
function LinePlot({
  data,
  width = 800,
  height = 500,
  marginTop = 20,
  marginRight = 30,
  marginBottom = 30,
  marginLeft = 30,
  colors,
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
          if (property !== "date" && property !== "SOC")
            valsList.push(d[property]);
        }
        return d3.min(valsList);
      }),
      d3.max(data, (d) => {
        let valsList = [];
        for (const property in d) {
          if (property !== "date" && property !== "SOC")
            valsList.push(d[property]);
        }
        return d3.max(valsList);
      }),
    ],
    [height - marginBottom, marginTop]
  );

  const socY = d3.scaleLinear([0, 100], [height - marginBottom, marginTop]);

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
    [xAxis, x]
  );

  // Add the y-axis to the container.
  const yAxis = useRef(d3.create("g"));
  useEffect(
    () =>
      void d3
        .select(yAxis.current)
        .attr("transform", `translate(${marginLeft}, 0)`)
        .call(d3.axisLeft(y).ticks(height / 40, ".1f"))
        .call((g) => g.select(".domain").remove())
        .call((g) =>
          g
            .selectAll(".tick line")
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

  const yAxisSOC = useRef(d3.create("g"));
  useEffect(
    () =>
      void d3
        .select(yAxisSOC.current)
        .attr("transform", `translate(${width - marginRight}, 0)`)
        .call(d3.axisRight(socY).ticks(height / 40, ".1f"))
        .call((g) => g.select(".domain").remove())
        .call((g) =>
          g
            .append("text")
            .attr("x", -marginLeft)
            .attr("y", 10)
            .attr("fill", "currentColor")
            .attr("text-anchor", "start")
            .text("SOC (%)")
        ),
    [yAxis, y]
  );

  const tooltip = useRef();
  const bisect = d3.bisector((d) => new Date(d.date)).center; // function that gets the
  const pointerMoved = (e) => {
    const i = bisect(data, x.invert(d3.pointer(e)[0]));

    void d3
      .select(tooltip.current)
      .style("display", null)
      .attr(
        "transform",
        `translate(${x(new Date(data[i].date))},${y(data[i].pActual)})`
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
                    ? d3.timeFormat("%a %B %d %I:%M %p")(new Date(data[i][d]))
                    : d === "SOC"
                    ? d3.format(".1f")(data[i][d]) + "%"
                    : d3.format(".2f")(data[i][d]) + " kW"
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

  const drawLine = (property, missingRef, realRef) => {
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
          .attr("class", property)
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
          .attr("class", property)
          .attr("fill", "none")
          .attr("stroke", colors[property ? property : 0])
          .attr("stroke-width", 1.5)
          .attr("d", line(data)),
      [realRef, line]
    );
  };
  const missingPActual = useRef(d3.create("path"));
  const realPActual = useRef(d3.create("path"));
  drawLine("pActual", missingPActual, realPActual);

  const BESSCheck = useSelector((state) => state.data.batteryProfile);
  const missingPBESS = useRef(d3.create("path"));
  const realPBESS = useRef(d3.create("path"));
  drawLine("pBESS", missingPBESS, realPBESS);

  const missingPBuilding = useRef(d3.create("path"));
  const realPBuilding = useRef(d3.create("path"));
  drawLine("pBuilding", missingPBuilding, realPBuilding);

  const missingPMeter = useRef(d3.create("path"));
  const realPMeter = useRef(d3.create("path"));
  drawLine("pMeter", missingPMeter, realPMeter);

  const missingPGoal = useRef(d3.create("path"));
  const realPGoal = useRef(d3.create("path"));
  drawLine("pGoal", missingPGoal, realPGoal);

  const SOCref = useRef(d3.create("path"));
  const SOCline = d3
    .line()
    .defined((d) => !isNaN(d["pActual"]))
    .x((d) => x(Date.parse(d.date)))
    .y((d) => socY(d.SOC));

  useEffect(
    () =>
      void d3
        .select(SOCref.current)
        .attr("class", "SOC")
        .attr("fill", "none")
        .attr("stroke", colors["SOC"])
        .attr("stroke-opacity", 0.6)
        .attr("stroke-width", 1.5)
        .attr("stroke-dasharray", [10, 8])
        .attr("d", SOCline(data.filter((d) => !isNaN(d.SOC)))),
    [SOCref, SOCline]
  );

  const svgRef = useRef();
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
    <>
      <svg ref={svgRef}>
        <g ref={xAxis} />
        <g ref={yAxis} />
        <g ref={yAxisSOC} />
        <g>
          <path ref={missingPGoal} />
          <path ref={realPGoal} />
          <path ref={missingPActual} />
          <path ref={realPActual} />
          <path ref={missingPBESS} />
          <path ref={realPBESS} />
          <path ref={missingPBuilding} />
          <path ref={realPBuilding} />
          <path ref={missingPMeter} />
          <path ref={realPMeter} />
          <path ref={SOCref} />
        </g>
        <g ref={tooltip} />
      </svg>
    </>
  );
}

function Legend({ data, colors }) {
  function onClick(event, key) {
    d3.selectAll("." + key).style(
      "visibility",
      d3.selectAll("." + key).style("visibility") === "visible"
        ? "hidden"
        : "visible"
    );
  }
  return (
    <div>
      {(() => {
        const keyList = [];
        for (const key of Object.keys(data[0])) {
          if (key !== "date")
            keyList.push(
              <button
                key={key}
                onClick={(e) => onClick(e, key)}
                style={{
                  color: colors[key],
                  //border: "none",
                  backgroundColor: "white",
                }}
              >
                {key}
              </button>
            );
        }
        return keyList;
      })()}
    </div>
  );
}

function PLTLinePlot({ data, colors, hidden }) {
  const pltRef = useRef();

  useEffect(() => {
    const processedData = data.flatMap(({ date: head, ...tail }) =>
      Object.keys(tail).map((d) => {
        return { Date: head, key: d, Value: tail[d] };
      })
    );
    console.log(processedData);

    const drawLine = () => {
      const missingLine = Plot.lineY(processedData, {
        filter: (d) => !isNaN(d.Value),
        x: "Date",
        y: "Value",
        z: "key",
        strokeOpacity: 0.3,
        strokeDasharray: [10, 8],
        tip: true,
      });
      console.log(missingLine);
      return [
        missingLine,
        Plot.lineY(processedData, {
          x: "Date",
          y: "Value",
          z: "key",
          stroke: "key",
        }),
      ];
    };

    const plot = Plot.plot({
      y: { grid: true, label: "Power (kW)", nice: true },
      x: { grid: true, label: "Date", nice: true },
      color: { range: colors, legend: true },
      marks: [...drawLine(), Plot.axisX({ tickSpacing: 80 })],
    });
    pltRef.current.append(plot);
    return () => plot.remove();
  }, [data]);

  return <div ref={pltRef} />;
}

export default function BuildingPowerTools({ className, style }) {
  const [data, setData] = useState(
    useSelector((state) => state.data.buildingPower)
  );
  const colors = {
    pActual: "blue",
    pBESS: "black",
    pBuilding: "purple",
    pMeter: "red",
    pGoal: "orange",
    SOC: "#08f",
  };

  return (
    <div className={className} style={style}>
      <h2>Building Power</h2>
      <CSVField setFunction={setData} />
      <DPSSettings setFunction={setData} />
      <LinePlot data={data} colors={colors} />
      <Legend data={data} colors={colors} />
      <DownloadButton chartData="buildingPower" fileName="DPS_Data.csv" />
    </div>
  );
}
