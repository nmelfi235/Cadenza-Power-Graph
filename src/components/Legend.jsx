import { useState } from "react";
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

export default function Legend({ data, colors }) {
  return (
    <div className="legend">
      {(() => {
        const keyList = [];
        for (const key of Object.keys(data[0])) {
          if (key !== "date")
            keyList.push(
              <LegendButton key={key} keyName={key} color={colors[key]} />
            );
        }
        return keyList;
      })()}
    </div>
  );
}

function LegendButton({ keyName, color }) {
  const [pressed, setPressed] = useState(false);

  function onClick(event, key) {
    d3.selectAll("." + key).style(
      "visibility",
      d3.selectAll("." + key).style("visibility") === "visible" && !pressed
        ? "hidden"
        : "visible"
    );
    setPressed(!pressed);
  }

  return (
    <button
      onClick={(e) => onClick(e, keyName)}
      style={{ color: color, backgroundColor: pressed && "black" }}
    >
      {keyName}
    </button>
  );
}
