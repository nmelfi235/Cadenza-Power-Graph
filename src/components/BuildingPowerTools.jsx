import { useDispatch, useSelector } from "react-redux";
import {
  resetBatteryProfile,
  resetBuildingData,
  setBatteryProfile,
  setBuildingData,
  setDPSProperty,
  getPeakMeter,
  getPeakPower,
  getSOC,
  getPeakBESS,
  setSolarData,
  setSolarState,
  resetSolarData,
  setRecGoal,
} from "../dataSlice.js";
import store from "../app/store.js";
import { parse } from "papaparse";
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { useRef, useEffect, useState } from "react";
import {
  pActual,
  pBuilding,
  pBESS,
  pMeter,
  pGoal,
  resetData,
  pSolar,
} from "../app/Calculations";
import { tickFormat } from "../app/Helpers";
import DownloadButton from "./DownloadButton";
import DPSSettings from "./SettingsUI/DPSSettings.jsx";
import Legend from "./Legend.jsx";
import BatterySettings from "./SettingsUI/BatterySettings.jsx";
import ACLoadSettings from "./SettingsUI/ACLoadSettings.jsx";
import ArbitrageSettings from "./SettingsUI/ArbitrageSettings.jsx";
import PdfGen from "./PdfGen.jsx";
import simplify from "simplify-js";
import { EventsTable } from "./EventsTable.jsx";
import PeakSettings from "./SettingsUI/PeakSettings.jsx";
import { GoalsTable } from "./GoalsTable.jsx";
import { setCurrentGoal } from "../slices/goals.js";

// This component is the form where the .csv file will be inputthen parsed and sent to the redux store for use in other components.
function CSVField() {
  const [file, setFile] = useState(null);
  const dispatch = useDispatch();

  // Enable bootstrap tooltips
  useEffect(() => {
    const tooltipTriggerList = document.querySelectorAll(
      '[data-bs-toggle="tooltip"]',
    );
    const tooltipList = [...tooltipTriggerList].map(
      (tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl),
    );
    return () => {
      tooltipList.map((t) => t.dispose());
    };
  }, [file]);

  const updateData = () => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        resetData();
        dispatch(resetBuildingData());
        dispatch(resetBatteryProfile());
        dispatch(setCurrentGoal({}));
        const content = ev.target.result;
        const parsedContent = parse(content).data.map((d) => {
          return {
            x: new Date(d[0]),
            y: !isNaN(parseFloat(d[1])) ? parseFloat(d[1]) : 0,
          };
        });
        parsedContent.pop();
        parsedContent.shift();

        const batteryStats = []; // contents are created in parsedPower mapping
        const solarPower = store.getState().data.solarPower;
        //console.log(parsedContent);
        const parsedPower = parsedContent.map((datum) => {
          const date = datum.x.toString(); //datum[0]; //new Date(datum[0]);
          //  +new Date(datum[0]) // + +new Date(1000 * 60 * 60 * 5) // timezone -5:00 GMT
          //).toString();
          const power = datum.y; //!isNaN(parseFloat(datum[1]))
          //? parseFloat(datum[1])
          //: NaN;
          batteryStats.push({
            date: date,
            voltage: store.getState().data.batteryState.batteryVoltage,
            current: store.getState().data.batteryState.batteryCurrent,
          });
          return {
            date: date,
            MeterData: (() => {
              dispatch(getPeakPower({ time: date, power: power }));
              let actual = parseFloat(pActual(date, power).toFixed(2));
              //console.log("Actual: ", actual);
              return actual;
            })(),
            SolarPower: (() => {
              let solar = parseFloat(pSolar(solarPower, date).toFixed(2));
              dispatch(setSolarState(solar));
              //console.log("Solar: ", solar);
              return solar;
            })(),
            ...(!(store.getState().goals.goals.length === 0) && {
              PowerGoal: (() => {
                let goal = parseFloat(pGoal(date));
                //console.log("Goal: ", goal);
                return goal;
              })(),
            }),
            BatteryPower: (() => {
              let BESS = parseFloat(pBESS(date, power).toFixed(2));
              dispatch(getPeakBESS({ BESS: BESS }));
              //console.log("BESS: ", BESS);
              return BESS;
            })(),
            TotalPower: (() => {
              let building = parseFloat(pBuilding(date, power).toFixed(2));
              //console.log("Building: ", building);
              return building;
            })(),
            ProjectedMeter: (() => {
              let meter = parseFloat(pMeter(date, power).toFixed(2));
              dispatch(getPeakMeter({ time: date, meter: meter }));
              //console.log("Meter: ", meter);
              return meter;
            })(),
            SOC: (() => {
              dispatch(getSOC());
              let soc_now = parseFloat(
                store.getState().data.batteryState.batterySOC.toFixed(2),
              );
              //console.log("SOC: " + soc_now);
              return soc_now;
            })(),
          };
        });
        dispatch(setBuildingData(parsedPower));
        dispatch(setBatteryProfile(batteryStats));
        dispatch(setRecGoal());
      };
      reader.readAsText(file);
    }
  };

  useEffect(() => updateData(), [file]);

  const handleChange = (event) => {
    event.preventDefault();

    setFile(event.target.files[0]);
  };

  const handleSolarChange = (event) => {
    event.preventDefault();
    const reader = new FileReader();
    reader.onload = (ev) => {
      dispatch(resetSolarData);
      const content = ev.target.result;
      const parsedContent = parse(content).data;
      parsedContent.pop();
      parsedContent.shift();

      const parsedSolar = parsedContent.map((datum) => {
        const date = datum[0];
        const power = !isNaN(parseFloat(datum[1])) ? parseFloat(datum[1]) : 0;
        return { date: date, power: -power };
      });

      dispatch(setSolarData(parsedSolar));
    };
    reader.readAsText(event.target.files[0]);
  };

  return (
    <form className="d-flex flex-column w-75 justify-content-center align-items-center">
      <div className="d-flex flex-row justify-content-center mx-2">
        <div className="d-flex flex-column mx-2 text-bg-success p-2 rounded">
          <p className="lead m-0">Interval Data:</p>
          <div className="form-check form-switch my-0">
            <input type="checkbox" className="form-check-input" role="switch" />
            <label className="form-check-label">w/ Solar</label>
          </div>
          <input
            type="file"
            name="building"
            onChange={handleChange}
            className="form-control mb-1"
          />
        </div>
        <div className="d-flex flex-column text-bg-warning p-2 rounded">
          <p className="lead">Solar Data:</p>
          <input
            type="file"
            name="solar"
            onChange={handleSolarChange}
            className="form-control"
          />
        </div>
      </div>
      <div className="d-flex flex-row justify-content-center my-2 w-100">
        <input
          type="reset"
          className="btn btn-danger mx-2 w-20"
          data-bs-toggle="tooltip"
          data-bs-placement="right"
          title="Click to reset data"
          onClick={(e) => {
            setFile(null);
          }}
        />
        <button
          className="btn btn-primary w-20"
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
      </div>
    </form>
  );
}

// This component generates a line plot. Modified D3 sample line plot for react.
function LinePlot({
  data,
  width = 1000,
  height = 500,
  marginTop = 35,
  marginRight = 50,
  marginBottom = 35,
  marginLeft = 80,
  colors,
}) {
  d3.select("#power-graph").selectAll("g").remove();
  const svgRef = useRef(null);
  useEffect(() => {
    d3.select(svgRef.current)
      .attr("id", "power-graph")
      .attr("preserveAspectRatio", "xMinYMin meet")
      .attr(
        "viewBox",
        `0 0 ${width + marginLeft + marginRight} ${
          height + marginBottom + marginTop
        }`,
      )
      .on("pointerenter pointermove", pointerMoved)
      .on("pointerleave", pointerLeft);
    /*.call(
        d3.brushX().extent([
          [marginLeft, marginTop],
          [width - marginRight, height - marginBottom],
        ])
      )*/
  }, [data, svgRef]);

  // X Scale declaration (Domain is start thru end date, range is physical screen space)
  const x = d3.scaleTime(
    d3.extent(data, (d) => Date.parse(d.date)),
    [marginLeft, width - marginRight],
  );

  // Y Scale declaration (Domain is min to max power, range is physical screen space)
  const valsList = data.flatMap((d) => [
    ...Object.keys(d)
      .filter((k) => k !== "date" && k !== "SOC")
      .map((k) => d[k]),
  ]);
  const y = d3.scaleLinear(
    [d3.min(valsList), d3.max(valsList)],
    [height - marginBottom, marginTop],
  );

  // Second y-scale for second y-axis
  const socY = d3.scaleLinear([0, 100], [height - marginBottom, marginTop]);

  // Add the x-axis to the container.
  useEffect(
    () =>
      void d3
        .select(svgRef.current)
        .append("g")
        .attr("transform", `translate(0, ${height - marginBottom})`)
        .style("font-size", "14px")
        .call(
          d3.axisBottom(x).ticks(10).tickFormat(tickFormat).tickSizeOuter(0),
        )
        .call((g) =>
          g
            .selectAll(".tick line")
            .attr("y2", -height + marginTop + marginBottom)
            .attr("stroke-opacity", 0.1)
            .attr("stroke-dasharray", [8, 10]),
        ),
    [data, svgRef, x],
  );

  // Add the y-axis to the container.
  useEffect(
    () =>
      void d3
        .select(svgRef.current)
        .append("g")
        .attr("transform", `translate(${marginLeft}, 0)`)
        .style("font-size", "14px")
        .call(d3.axisLeft(y).ticks(height / 50, ",.1f"))
        .call((g) => g.selectAll("text").text((d) => " " + d))
        .call((g) => g.select(".domain").remove())
        .call((g) =>
          g
            .selectAll(".tick line")
            .attr("x2", width - marginLeft - marginRight)
            .attr("stroke-opacity", 0.1),
        )
        .call((g) =>
          g
            .append("text")
            .attr("x", -marginLeft)
            .attr("y", marginTop - height / 25)
            .attr("fill", "currentColor")
            .attr("text-anchor", "start")
            .style("font-size", "18px")
            .style("font-weight", "bold")
            .text("Power (kW)"),
        ),
    [data, svgRef, y],
  );

  // Add the second y-axis to the container
  useEffect(() => {
    void d3
      .select(svgRef.current)
      .append("g")
      .classed("SOC", true)
      .attr("transform", `translate(${width - marginRight}, 0)`)
      .style("font-size", "14px")
      .call(d3.axisRight(socY).ticks(10, ".0f"))
      .call((g) => g.select(".domain").remove())
      .call((g) =>
        g
          .append("text")
          .attr("x", 0)
          .attr("y", marginTop - height / 25)
          .attr("fill", colors["SOC"])
          .attr("text-anchor", "start")
          .style("font-size", "18px")
          .text("SOC (%)"),
      );
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
        `translate(${d3.pointer(e)[0]},${d3.pointer(e)[1] + 15})`,
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
                }`,
            ),
          )
          .join("tspan")
          .attr("class", (d) => "tooltip-label " + d.match(/\w+/))
          .attr("x", 0)
          .attr("y", (d, i) => `${i * 1.1}em`)
          .attr("font-weight", (d, i) => (i ? null : "bold"))
          .text((d) => d),
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
      `M${-w / 2 - 10},5H-5l5,-5l5,5H${w / 2 + 10}v${h + 20}h-${w + 20}z`,
    );
  }

  const drawLine = (property) => {
    const isFinite = (n) => (Number.isFinite(n) ? n : 0);
    const simpleData = simplify(
      [
        ...data.map((datum) => {
          return {
            x: isFinite(x(Date.parse(datum.date))),
            y: isFinite(y(datum[property])),
          };
        }),
      ],
      1,
      false,
    );

    const lines = d3.select(svgRef.current).append("g");
    // Line generator (Draws line only showing points that are not missing, hiding the missing points)
    const line = d3
      .line()
      .defined((d) => !isNaN(d.y))
      .x((d) => d.x)
      .y((d) => d.y);

    /*lines
      .append("path")
      .attr("class", property)
      .attr("fill", "none")
      .attr("stroke", "#ccc")
      .attr("stroke-width", 1.5)
      .attr("stroke-dasharray", [10, 8])
      .attr("d", line(simpleData.filter((d) => isNaN(d.y))));*/

    lines
      .append("path")
      .attr("class", property)
      .attr("fill", "none")
      .attr("stroke", colors[property ? property : 0])
      .attr("stroke-width", 1.5)
      .attr("d", line(simpleData.filter((d) => !isNaN(d.y))));
  };

  useEffect(() => {
    const simpleData = simplify(
      [
        ...data.map((datum) => {
          return { x: x(Date.parse(datum.date)), y: socY(datum["SOC"]) };
        }),
      ],
      1,
      false,
    );

    // Percentage axis
    const line = d3
      .line()
      .defined((d) => !isNaN(d.y))
      .x((d) => d.x)
      .y((d) => d.y);

    d3.select("#SOCLine").remove();
    d3.select(svgRef.current)
      .append("path")
      .attr("class", "SOC")
      .attr("fill", "none")
      .attr("stroke", colors["SOC"])
      .attr("stroke-width", 1.5)
      .attr("d", line(simpleData))
      .attr("id", "SOCLine");

    // Power axis
    for (const key in data[0])
      if (key !== "date" && key !== "SOC") drawLine(key);
  }, [data, svgRef]);

  //d3.select(svgRef.current).exit().remove();

  return (
    <>
      {" "}
      <svg ref={svgRef} />
    </>
  );
}

function EnergyMeter({ className, style }) {
  const { charge, discharge } = useSelector((state) => state.data.energy);
  const {
    minSOC,
    peakDataOn,
    peakDataOff,
    peakMeterOn,
    peakMeterOff,
    peakBESS,
    recGoal,
  } = useSelector((state) => state.data.others);
  const {
    onPeak,
    offPeak,
    onPeakBESS,
    offPeakBESS,
    totalEnergy,
    totalEnergyBESS,
  } = useSelector((state) => state.data.peakTotals);

  console.log(charge, discharge);

  return (
    <div className="d-flex flex-column align-items-left border-top my-2">
      <h1 className="lead">Energy Exchanged</h1>
      <div className="d-flex flex-row gap-4 my-2">
        <table className="table table-bordered table-sm">
          <caption>BESS</caption>
          <thead className="thead-light">
            <tr>
              <td>Charged</td>
              <td>Discharged</td>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{d3.format(",.2f")(charge)} kWh</td>
              <td>{d3.format(",.2f")(discharge)} kWh</td>
            </tr>
          </tbody>
        </table>
        <table className="table table-bordered table-sm">
          <caption>
            Site Total: {d3.format(",.2f")(totalEnergy)} kWh
            <br />
            Meter Total: {d3.format(",.2f")(totalEnergyBESS)}
          </caption>
          <thead className="thead-light">
            <tr>
              <th className="blank-cell"></th>
              <th>On-Peak</th>
              <th>Off-Peak</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">Interval Data</th>
              <td>{d3.format(",.2f")(onPeak)} kWh</td>
              <td>{d3.format(",.2f")(offPeak)} kWh</td>
            </tr>
            <tr>
              <th scope="row">w/ BESS</th>
              <td>{d3.format(",.2f")(onPeakBESS)} kWh</td>
              <td>{d3.format(",.2f")(offPeakBESS)} kWh</td>
            </tr>
          </tbody>
        </table>
        <table className="table table-bordered table-sm">
          <caption>Peak Usage</caption>
          <thead className="thead-light">
            <tr>
              <th className="blank-cell"></th>
              <th>On-Peak</th>
              <th>Off-Peak</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">Interval Data</th>
              <td>{d3.format(",.2f")(peakDataOn)} kW</td>
              <td>{d3.format(",.2f")(peakDataOff)} kW</td>
            </tr>
            <tr>
              <th scope="row">w/ BESS</th>
              <td>{d3.format(",.2f")(peakMeterOn)} kW</td>
              <td>{d3.format(",.2f")(peakMeterOff)} kW</td>
            </tr>
          </tbody>
        </table>
      </div>
      <table className="table table-bordered table-sm">
        <caption>Other Statistics</caption>
        <thead>
          <tr>
            <th>Minimum SOC</th>
            <th>Peak BESS Discharge Power</th>
            {/*<th>Recommended Goal</th>*/}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{d3.format(",.1f")(minSOC)}%</td>
            <td>{d3.format(",.2f")(peakBESS)} kW</td>
            {/*<td>{d3.format(",.2f")(recGoal)}</td>*/}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default function BuildingPowerTools({ className, style }) {
  const data = useSelector((state) => state.data.buildingPower);
  const colors = {
    MeterData: "lightgreen",
    BatteryPower: "darkblue",
    TotalPower: "purple",
    ProjectedMeter: "red",
    PowerGoal: "orange",
    SOC: "#08f",
    SolarPower: "#093",
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
          <ArbitrageSettings />
          <PeakSettings />
        </div>
        <div className="d-flex flex-row justify-content-center">
          <GoalsTable
            className="card p-4 d-flex flex-column align-items-left"
            style={{ height: 300, width: 700, verticalAlign: "center" }}
          />
          <EventsTable
            className="card p-4 d-flex flex-column align-items-left"
            style={{ height: 300, width: 700, verticalAlign: "center" }}
          />
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
            <div className="d-flex flex-row w-100 h-50 align-items-center border-right my-2">
              <p>Power (kW)</p>
              <LinePlot data={data} colors={colors} />
              <p>SOC (%)</p>
            </div>
            <Legend data={data} colors={colors} />
            <EnergyMeter />
          </div>
          <div
            className="d-flex flex-column align-items-center border-top my-2"
            data-section
            style={{ "--section-num": 4 }}
          >
            <p className="lead my-2">Step 3: Download your projected data.</p>
            <div className="d-flex flex-row align-items-center">
              <DownloadButton
                chartData="buildingPower"
                fileName="DPS_Data.csv"
              />
              <p className="lead px-4">or</p>
              <PdfGen />
            </div>
          </div>
        </>
      ) : (
        <></>
      )}
    </div>
  );
}
