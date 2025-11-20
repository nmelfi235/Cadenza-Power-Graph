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
    const { minSOC, peakBESS, peakData, peakMeter } =
      store.getState().data.others;
    const t1rows = [
      [
        d3.format(",.1f")(minSOC) + "%",
        d3.format(",.2f")(peakBESS) + " kW",
        d3.format(",.2f")(peakData) + " kW",
        d3.format(",.2f")(peakMeter) + " kW",
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
      .then(() => doc.svg(graph, { x: 70, y: 190, width: 600, height: 300 }))
      .then(() => {
        doc.setFontSize(14);
        doc.text(y1Label, 60, 370, { angle: 90 });
      })
      .then(() => {
        doc.setFontSize(14);
        doc.text(y2Label, 530, 310, { angle: -90 });
      })
      .then(() =>
        doc.html(legend, { x: 85, y: 450, html2canvas: { scale: 0.75 } })
      )
      .then(() => doc.autoTable({ head: t1columns, body: t1rows, startY: 500 }))
      .then(() => doc.autoTable({ head: t2columns, body: t2rows, startY: 570 }))
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
