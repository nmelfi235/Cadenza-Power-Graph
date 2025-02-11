import { useState, useEffect, useRef } from "react";
import * as d3 from "d3";

function LineGraph({
  marginTop = 50,
  marginRight = 50,
  marginBottom = 50,
  marginLeft = 80,
  width = 800,
  height = 400,
  data,
}) {
  // Ensures that the graph will redraw every time the data has changed
  d3.select("#grid-load-graph").selectAll("g").remove();
  console.log(data);

  // SVG Properties
  const svgRef = useRef(d3.create("svg"));
  useEffect(
    () =>
      void d3
        .select(svgRef.current)
        .attr("id", "grid-load-graph")
        .attr("width", width + marginLeft + marginRight)
        .attr("height", height + marginBottom + marginTop),
    //.on("pointerenter pointermove", pointerMoved)
    //.on("pointerleave", pointerLeft);
    [data, svgRef]
  );

  // X Scale
  const x = d3.scaleTime(
    [new Date(data[0]["Date"]), new Date(data[data.length - 1]["Date"])],
    [marginLeft, width]
  );

  // Y Scale
  const loadData = data.map((d) => parseFloat(d["Load"]));
  const y = d3.scaleLinear(
    [d3.min(loadData), d3.max(loadData)],
    [height - marginBottom, marginTop]
  );

  // X Axis
  useEffect(
    () =>
      void d3
        .select(svgRef.current)
        .append("g")
        .attr("transform", `translate(0, ${height - marginBottom})`)
        .call(d3.axisBottom(x))
        .style("font-size", 15),
    [data, svgRef]
  );

  // Y Axis
  useEffect(
    () =>
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
            .attr("x", marginLeft + 10)
            .attr("y", marginTop / 2 + 15)
            .attr("fill", "currentColor")
            //.attr("transform", `rotate(-90, 0, ${height / 2})`)
            .attr("font-size", 15)
            .text("Grid Load (MW)")
        ),
    [data, svgRef]
  );

  const line = d3
    .line()
    .x((d) => x(new Date(d["Date"])))
    .y((d) => y(parseFloat(d["Load"])));

  useEffect(
    () =>
      void d3
        .select(svgRef.current)
        .append("g")
        .append("path")
        .attr("d", line(data))
        .attr("stroke", "orange")
        .attr("fill", "transparent"),
    [data, svgRef]
  );

  d3.select(svgRef.current).exit().remove();
  return <svg ref={svgRef} />;
}

const fetchGridLoadData = async () => {
  const url = "http://127.0.0.1:1880/gridLoad";
  return await fetch(url, { method: "GET" }).then((res) => res.json());
};

function GridLoadGraph({ className, style }) {
  const [data, setData] = useState([]); // Data will be an array of objects

  useEffect(() => {
    fetchGridLoadData().then((d) => setData(d));
    const fetchInterval = setInterval(() => {
      fetchGridLoadData().then((d) => setData(d));
    }, 60000);
    return () => clearInterval(fetchInterval);
  }, []);

  return (
    <div className={className} style={style}>
      <h1 className="text-center display-6">Grid Load</h1>
      <div className="text-center">
        {" "}
        {data.length > 1 ? <LineGraph data={data} height={800} /> : <></>}
      </div>
    </div>
  );
}

export default GridLoadGraph;
