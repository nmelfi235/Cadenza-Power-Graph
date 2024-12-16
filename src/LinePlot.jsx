import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { useRef, useEffect } from "react";
import { useSelector } from "react-redux";

// This component generates a line plot.
export default function LinePlot({
  data = useSelector((state) => state.formData),
  width = 800,
  height = 400,
  marginTop = 50,
  marginRight = 50,
  marginBottom = 50,
  marginLeft = 50,
}) {
  const x = d3.scaleLinear(
    [0, data.length - 1],
    [marginLeft, width - marginRight]
  );
  const y = d3.scaleLinear(d3.extent(data), [height - marginBottom, marginTop]);

  const gx = useRef();
  const gy = useRef();

  // useEffect manipulates gx and gy as a side effect to creating the axes.
  // The [gx, x] at the end is the context for the useEffect call.
  useEffect(
    () =>
      void d3
        .select(gx.current)
        .call(d3.axisBottom(x))
        .attr("id", "x-axis")
        .attr("transform", `translate(0, ${height - marginBottom})`),
    [gx, x]
  );
  useEffect(
    () =>
      void d3
        .select(gy.current)
        .call(d3.axisLeft(y))
        .attr("id", "y-axis")
        .attr("transform", `translate(${marginLeft})`),
    [gy, y]
  );

  const line = d3.line((d, i) => x(i), y);
  return (
    <svg className="graph" width={width} height={height}>
      <g ref={gx} />
      <g ref={gy} />
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        d={line(data)}
      />
      <g fill="white" stroke="currentColor" strokeWidth="1.5">
        {data.map((d, i) => {
          if (i % 15 === 0)
            return <circle key={i} cx={x(i)} cy={y(d)} r="2.5" />;
        })}
      </g>
    </svg>
  );
}
