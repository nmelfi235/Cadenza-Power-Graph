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
  const svgRef = useRef(d3.create("svg"));
  useEffect(() => {
    d3.select(svgRef.current)
      .attr("width", width + marginLeft + marginRight)
      .attr("height", height + marginBottom + marginTop);
    //.on("pointerenter pointermove", pointerMoved)
    //.on("pointerleave", pointerLeft);
  }, [data, svgRef]);

  const x = d3.scaleTime(
    [
      new Date(data[0][0]["Date"]),
      new Date(data[0][data[0].length - 1]["Date"]),
    ],
    [marginLeft, width]
  );

  const emissionData = data.flat().map((d) => parseFloat(d["Emissions"]));
  const y = d3.scaleLinear(
    [d3.min(emissionData), d3.max(emissionData)],
    [height - marginBottom, marginTop]
  );

  const colors = {
    Refuse: "#723b17",
    Wood: "#AB4A00",
    Coal: "#3E4B50",
    Oil: "#62777F",
    "Landfill Gas": "#40D397",
    "Natural Gas": "#6dcff6",
    Total: "#f63c3d",
  };

  const xAxisRef = useRef(d3.create("g"));
  useEffect(() => {
    d3.select(xAxisRef.current)
      .attr("transform", `translate(0, ${height - marginBottom})`)
      .call(d3.axisBottom(x));
  }, [data, xAxisRef]);

  const yAxisRef = useRef(d3.create("g"));
  useEffect(() => {
    d3.select(yAxisRef.current)
      .attr("transform", `translate(${marginLeft}, 0)`)
      .call(d3.axisLeft(y));
  }, [data, yAxisRef]);

  const line = d3
    .line()
    .x((d) => x(new Date(d["Date"])))
    .y((d) => y(parseFloat(d["Emissions"])))
    .curve(d3.curveNatural);

  const linesRef = useRef(d3.create("g"));
  useEffect(() => {
    d3.select(linesRef.current)
      .selectAll("path")
      .data(data)
      .join("path")
      .attr("d", line)
      .attr("stroke", (d, i) => colors[d[0]["FuelCategory"]])
      .attr("fill", "transparent");
  }, [data, linesRef]);

  return (
    <svg ref={svgRef}>
      {/*<g ref={tooltip} />*/}
      <g ref={xAxisRef} />
      <g ref={yAxisRef} />
      <g ref={linesRef} />
    </svg>
  );
}

const fetchFromNodeRed = async () => {
  const url = "http://127.0.0.1:1880/genfuelmix";
  return await fetch(url, { method: "GET" }).then((res) => res.json());
};

function StateOfCarbon({ className, style }) {
  const [data, setData] = useState([]); // Data will be an array of objects

  useEffect(() => {
    fetchFromNodeRed().then((d) => setData(d));
  }, []);

  return (
    <div className={className} style={style}>
      <h1 className="text-center display-6">
        Estimated CO<sub>2</sub> Emissions
      </h1>
      {data.length > 0 ? <LineGraph data={data} height={800} /> : <></>}
    </div>
  );
}

export default StateOfCarbon;
