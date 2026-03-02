import { jsPDF } from "jspdf";
import { svg2pdf } from "svg2pdf.js";
import { applyPlugin } from "jspdf-autotable";
import logo from "../assets/cadenza_logo.png";
import { useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import store from "../app/store";
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

applyPlugin(jsPDF);

export default function PdfGen() {
  const [pdf_title, change_title] = useState("Report Name");

  const onClick = () => {
    const doc = new jsPDF({ format: "a4", unit: "pt" });
    const logoEl = renderToStaticMarkup(<img src={logo} />);

    const reportName = pdf_title;

    const graphTitle = "Building Power";

    const graph = document.getElementById("power-graph");

    const legend = document.getElementById("legend");

    const y1Label = "Power (kW)";
    const y2Label = "SOC (%)";

    const t0columns = [["Goal", "Maximum Discharge Power", "Capacity"]];
    const goal = store.getState().data.DPS.pGoal;
    const maxPower = store.getState().data.batterySettings.maxDischargePower;
    const capacity = store.getState().data.batterySettings.maxAmpHours / 20;
    const t0rows = [[goal + " kW", maxPower + " kW", capacity + " kWh"]];

    const t1columns = [
      ["Minimum SOC", "Peak Discharge", "Peak w/o BESS", "Peak w/ BESS"],
    ];
    const { minSOC, peakBESS, peakDataOn, peakMeterOn } =
      store.getState().data.others;
    const t1rows = [
      [
        d3.format(",.1f")(minSOC) + "%",
        d3.format(",.2f")(peakBESS) + " kW",
        d3.format(",.2f")(peakDataOn) + " kW",
        d3.format(",.2f")(peakMeterOn) + " kW",
      ],
    ];

    const t2columns = [["Energy Charged", "Energy Discharged"]];
    const { charge, discharge } = store.getState().data.energy;
    const t2rows = [
      [
        d3.format(",.2f")(charge) + " kWh",
        d3.format(",.2f")(discharge) + " kWh",
      ],
    ];

    const t3columns = [["", "On Peak Usage", "Off Peak Usage"]];
    const { onPeak, offPeak, onPeakBESS, offPeakBESS } =
      store.getState().data.peakTotals;
    const t3rows = [
      [
        "Interval Data",
        d3.format(",.2f")(onPeak) + " kWh",
        d3.format(",.2f")(offPeak) + " kWh",
      ],
      [
        "w/ BESS",
        d3.format(",.2f")(onPeakBESS) + " kWh",
        d3.format(",.2f")(offPeakBESS) + " kWh",
      ],
    ];

    const t4columns = [["Event Type", "Start Time", "End Time", "Power Level"]];
    const events = store.getState().data.events;
    const t4rows = [];
    for (const event of events) {
      let row = [];
      for (const info in event) {
        row.push(event[info]);
      }
      t4rows.push(row);
    }

    doc
      .html(logoEl, { x: 30, y: 10, html2canvas: { scale: 0.9 } })
      .then(() => {
        doc.setFontSize(18);
        doc.text(reportName, 40, 95, { maxWidth: 600 });
      })
      .then(() => doc.autoTable({ head: t0columns, body: t0rows, startY: 115 }))
      .then(() => {
        doc.setFontSize(24);
        doc.text(graphTitle, 225, 190, { maxWidth: 500 });
      })
      .then(() =>
        doc.svg(graph, {
          x: 40,
          y: 190,
          width: graph.clientWidth / 2,
          height: graph.clientHeight / 2,
        }),
      )
      .then(() =>
        doc.html(legend, { x: 80, y: 450, html2canvas: { scale: 0.55 } }),
      )
      .then(() => doc.autoTable({ head: t1columns, body: t1rows, startY: 500 }))
      .then(() => doc.autoTable({ head: t2columns, body: t2rows, startY: 570 }))
      .then(() => doc.autoTable({ head: t3columns, body: t3rows, startY: 630 }))
      .then(() => doc.autoTable({ head: t4columns, body: t4rows, startY: 700 }))
      .then(() => doc.output("dataurlnewwindow")); //doc.save("report.pdf"));

    //doc.output("datauristring");
  };

  return (
    <div className="d-flex flex-column">
      <input
        className="form-control"
        onChange={(i) => change_title(i.target.value)}
        type="text"
        placeholder="Report Name"
      />
      <button className="btn btn-primary m-1" type="button" onClick={onClick}>
        Download PDF
      </button>
    </div>
  );
}

export function PDFKitGen() {
  /**
   * Logo
   * Title
   * Input Table
   * Graph
   * Legend
   * Site Metrics Table
   * Solar Metrics Table
   * BESS Metrics Table
   */
  const [title, set_title] = useState("Report Name");

  const onClick = () => {
    let pdfElements = {
      Logo: "src/assets/cadenza_logo.png",
      Title: title,
      Inputs: getInputs(),
      Graph: getGraph(),
    };
  };

  return (
    <div className="d-flex flex-column">
      <input
        className="form-control"
        onChange={(i) => change_title(i.target.value)}
        type="text"
        placeholder="Report Name"
      />
      <button className="btn btn-primary m-1" type="button" onClick={onClick}>
        Download PDF
      </button>
    </div>
  );
}

const getInputs = () => {
  const goal = store.getState().data.DPS.pGoal;
  const { maxChargePower, maxDischargePower, maxAmpHours } =
    store.getState().data.batterySettings;
  const capacity = maxAmpHours / 20;
  return {
    goal,
    maxChargePower,
    maxDischargePower,
    capacity,
  };
};

const getGraph = () => {};
