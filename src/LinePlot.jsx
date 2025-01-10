import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import * as Plot from "@observablehq/plot";
import { useRef, useEffect, useState } from "react";
import { useSelector } from "react-redux";

// This component generates a line plot. Modified D3 sample line plot for react.
export default function LinePlot({
  data = useSelector((state) => state.data.buildingPower),
  width = 600,
  height = 350,
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
    [d3.min(data, (d) => d.power) * 1.25, d3.max(data, (d) => d.power) * 1.25],
    [height - marginBottom, marginTop]
  );

  // Line generator (Draws line only showing points that are not missing, hiding the missing points)
  const line = d3
    .line()
    .defined((d) => !isNaN(d.power))
    .x((d) => x(Date.parse(d.date)))
    .y((d) => y(d.power));

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

  const missingLine = useRef(d3.create("path"));
  useEffect(
    () =>
      void d3
        .select(missingLine.current)
        .attr("fill", "none")
        .attr("stroke", "#ccc")
        .attr("stroke-width", 1.5)
        .attr("stroke-dasharray", [10, 8])
        .attr("d", line(data.filter((d) => !isNaN(d.power)))),
    [missingLine, line]
  );

  const realLine = useRef(d3.create("path"));
  useEffect(
    () =>
      void d3
        .select(realLine.current)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", line(data)),
    [realLine, line]
  );

  const zoomFunction = (e) => {};

  return (
    <svg width={width} height={height}>
      <g ref={xAxis} />
      <g ref={yAxis} />
      <g>
        <path ref={missingLine} />
      </g>
      <g>
        <path ref={realLine} />
      </g>
    </svg>
  );
}
function PLTLinePlot({ data, colors }) {
  const pltRef = useRef();

  useEffect(() => {
    const processedData = data.flatMap(({ date: head, ...tail }) =>
      Object.keys(tail).map((d) => {
        return { Date: head, [d]: tail[d] };
      })
    );
    console.log(processedData);

    const drawLine = (property) => {
      return [
        Plot.lineY(data, {
          filter: (d) => isNaN(d[property]),
          x: "date",
          y: property,
          //strokeOpacity: 0.3,
          tip: true,
        }),
        Plot.lineY(data, {
          x: "date",
          y: property,
        }),
      ];
    };

    const plot = Plot.plot({
      y: { grid: true },
      x: { grid: true, axis: "bottom" },
      color: { scheme: colors },
      marks: [...drawLine("pActual")],
    });
    pltRef.current.append(plot);
    return () => plot.remove();
  }, [data]);

  return <div ref={pltRef} />;
}
