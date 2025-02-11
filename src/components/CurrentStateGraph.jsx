import { useState, useEffect, useRef } from "react";
import * as d3 from "d3";

function LineGraph({
  marginTop = 50,
  marginRight = 50,
  marginBottom = 50,
  marginLeft = 50,
  width = 800,
  height = 400,
  data,
}) {
  // Ensures that the graph will redraw every time the data has changed
  d3.select("#current-state-graph").selectAll("g").remove();

  // SVG Properties
  const svgRef = useRef(d3.create("svg"));
  useEffect(() => {
    d3.select(svgRef.current)
      .attr("id", "current-state-graph")
      .attr("width", width + marginLeft + marginRight)
      .attr("height", height + marginBottom + marginTop);
    //.on("pointerenter pointermove", pointerMoved)
    //.on("pointerleave", pointerLeft);
  }, [data, svgRef]);

  // X Scale
  const x = d3.scaleTime(
    [new Date(data[0]["Date"]), new Date(data[data.length - 1]["Date"])],
    [marginLeft, width]
  );

  // Y Scale
  const stateData = data.map((d) => parseFloat(d["State"]));
  const y = d3.scaleLinear(
    [d3.min(stateData), d3.max(stateData)],
    [height - marginBottom, marginTop]
  );

  // X Axis
  useEffect(() => {
    d3.select(svgRef.current)
      .append("g")
      .attr("transform", `translate(0, ${height - marginBottom})`)
      .call(d3.axisBottom(x))
      .style("font-size", 15);
  }, [data, svgRef]);

  // Y Axis
  useEffect(() => {
    void d3
      .select(svgRef.current)
      .append("g")
      .attr("transform", `translate(${marginLeft}, 0)`)
      .call(d3.axisLeft(y))
      .style("font-size", 15)
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
          .attr("x", marginLeft / 2)
          .attr("y", marginTop / 2 + 15)
          .attr("fill", "currentColor")
          //.attr("transform", `rotate(-90, 0, ${height / 2})`)
          .attr("font-size", 18)
          .text("kg / kWh")
      );
  }, [data, svgRef]);

  const line = d3
    .line()
    .x((d) => x(new Date(d["Date"])))
    .y((d) => y(parseFloat(d["State"])));

  useEffect(() => {
    d3.select(svgRef.current)
      .append("g")
      .append("path")
      .attr("d", line(data))
      .attr("stroke", "blue")
      .attr("fill", "transparent");
  }, [data, svgRef]);

  d3.select(svgRef.current).exit().remove();
  return <svg ref={svgRef} />;
}

const fetchCurrentStateData = async () => {
  const url = "http://127.0.0.1:1880/currentState";
  return await fetch(url, { method: "GET" }).then((res) => res.json());
};
function CurrentStateGraph({ className, style }) {
  const [data, setData] = useState([]); // Data will be an array of objects

  useEffect(() => {
    fetchCurrentStateData().then((d) => setData(d));
    const fetchInterval = setInterval(() => {
      fetchCurrentStateData().then((d) => setData(d));
    }, 60000);
    return () => clearInterval(fetchInterval);
  }, []);

  return (
    <div className={className} style={style}>
      <h1 className="text-center display-6">
        Relationship Between Grid Load and Carbon Emissions
      </h1>
      <div className="text-center">
        {" "}
        {data.length > 0 ? <LineGraph data={data} height={800} /> : <></>}
      </div>
    </div>
  );
}

export default CurrentStateGraph;
