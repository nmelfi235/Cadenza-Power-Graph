import { useRef, useEffect, useState } from "react";
import * as d3 from "d3";

// Data must be pre-processed before being input into LineGraph
function LineGraph({
  marginTop = 50,
  marginRight = 50,
  marginBottom = 50,
  marginLeft = 50,
  width = 800,
  height = 400,
  data,
  colors,
}) {
  /*
  const tooltip = useRef(d3.create("g"));
  const bisect = d3.bisector((d) => new Date(d["Date"])).center; // function that gets the
  const pointerMoved = (e) => {
    const i = bisect(data, x.invert(d3.pointer(e)[0]));

    void d3
      .select(tooltip.current)
      .style("display", null)
      .attr(
        "transform",
        `translate(${d3.pointer(e)[0]},${d3.pointer(e)[1] + 15})`
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
            data.map(
              (d, i) =>
                `${d[i]["Date"]}:  ${d3.timeFormat("%a %B %d %I:%M %p")(
                  new Date(data[i][d])
                )}
                 ${d[i]["FuelCategory"]}: ${
                  d3.format(".2f")(parseFloat(d[i]["Emissions"])) +
                  " metric tons per minute"
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
*/
  // Ensures that the graph will redraw every time the data has changed
  d3.select("#carbon-graph").selectAll("g").remove();

  // SVG Properties
  const svgRef = useRef(d3.create("svg"));
  useEffect(() => {
    d3.select(svgRef.current)
      .attr("id", "carbon-graph")
      .attr("width", width + marginLeft + marginRight)
      .attr("height", height + marginBottom + marginTop);
    //.on("pointerenter pointermove", pointerMoved)
    //.on("pointerleave", pointerLeft);
  }, [data, svgRef]);

  // X Scale
  const x = d3.scaleTime(
    [
      new Date(data[0][0]["Date"]),
      new Date(data[0][data[0].length - 1]["Date"]),
    ],
    [marginLeft, width]
  );

  // Y Scale
  const emissionData = data.flat().map((d) => parseFloat(d["Emissions"]));
  const y = d3.scaleLinear(
    [d3.min(emissionData), d3.max(emissionData)],
    [height - marginBottom, marginTop]
  );

  // X Axis
  useEffect(() => {
    d3.select(svgRef.current)
      .append("g")
      .attr("transform", `translate(0, ${height - marginBottom})`)
      .call(d3.axisBottom(x));
  }, [data, svgRef]);

  // Y Axis
  useEffect(() => {
    void d3
      .select(svgRef.current)
      .append("g")
      .attr("transform", `translate(${marginLeft}, 0)`)
      .call(d3.axisLeft(y))
      .call((g) =>
        g
          .selectAll(".tick line")
          .clone()
          .attr("x2", width - marginLeft)
          .attr("stroke-opacity", 0.1)
      )
      .call((g) =>
        g
          .append("text")
          .attr("x", marginLeft * 2)
          .attr("y", height / 2 - marginBottom / 2 - 5)
          .attr("fill", "currentColor")
          .attr("transform", `rotate(-90, 0, ${height / 2})`)
          .attr("font-size", 15)
          .text("CO2 (Metric Tons/min)")
      );
  }, [data, svgRef]);

  const line = d3
    .line()
    .x((d) => x(new Date(d["Date"])))
    .y((d) => y(parseFloat(d["Emissions"])));

  useEffect(() => {
    d3.select(svgRef.current)
      .append("g")
      .selectAll("path")
      .data(data)
      .join("path")
      .attr("d", line)
      .attr("stroke", (d, i) => colors[d[0]["FuelCategory"]])
      .attr("fill", "transparent");
  }, [data, svgRef]);

  d3.select(svgRef.current).exit().remove();
  return <svg ref={svgRef} />;
}

const fetchFromNodeRed = async () => {
  const url = "http://127.0.0.1:1880/genfuelmix";
  return await fetch(url, { method: "GET" }).then((res) => res.json());
};

const fetchCurrentData = async () => {
  const url = "http://127.0.0.1:1880/current";
  return await fetch(url, { method: "GET" }).then((res) => res.json());
};

function StateOfCarbon({ className, style }) {
  const [data, setData] = useState([]); // Data will be an array of objects
  const [currentData, setCurrentData] = useState({});

  const colors = {
    Refuse: "#723b17",
    Wood: "#AB4A00",
    Coal: "#3E4B50",
    Oil: "#62777F",
    "Landfill Gas": "#40D397",
    "Natural Gas": "#6dcff6",
    Total: "#f63c3d",
  };

  useEffect(() => {
    fetchFromNodeRed().then((d) => setData(d));
    fetchCurrentData().then((d) => setCurrentData(d));
    const fetchInterval = setInterval(() => {
      fetchFromNodeRed().then((d) => setData(d));
      fetchCurrentData().then((d) => setCurrentData(d));
    }, 60000);
    return () => clearInterval(fetchInterval);
  }, []);

  return (
    <div className={className} style={style}>
      <h1 className="text-center display-6">
        Estimated CO<sub>2</sub> Emissions
      </h1>
      <ul className="d-flex flex-wrap justify-content-center list-inline">
        {Object.keys(currentData).length > 0 ? (
          Object.keys(currentData).map((el, i) => (
            <li
              className="list-inline-item shadow-sm p-3 rounded"
              style={{ color: colors[el] }}
              key={i}
            >
              {el}: {currentData[el]} Metric Tons/min
            </li>
          ))
        ) : (
          <></>
        )}
      </ul>
      <div className="text-center">
        {data.length > 0 ? (
          <LineGraph data={data} colors={colors} height={800} />
        ) : (
          <></>
        )}
      </div>
    </div>
  );
}

export default StateOfCarbon;
