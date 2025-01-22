import { useSelector } from "react-redux";
import { Tooltip } from "bootstrap";
import { useEffect } from "react";

export default function DownloadButton({ chartData, fileName }) {
  const data = useSelector((state) => state.data[chartData]);
  const replacer = (key, value) => (value === null ? "" : value); // specify how you want to handle null values here
  const header = Object.keys(data[0]);
  const csvContent =
    "data:text/csv;charset=utf-8," +
    [
      header.join(","), // header row first
      ...data.map((row) =>
        header
          .map((fieldName) => JSON.stringify(row[fieldName], replacer))
          .join(",")
      ),
    ].join("\r\n");
  const encodedUri = encodeURI(csvContent);

  useEffect(() => {
    const tooltipTriggerList = document.querySelectorAll(
      '[data-bs-toggle="tooltip"]'
    );
    const tooltipList = [...tooltipTriggerList].map(
      (tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl)
    );
    return () => {
      tooltipList.map((t) => t.dispose());
    };
  }, []);

  return (
    <span>
      <a
        className="btn btn-primary"
        href={encodedUri}
        download={fileName}
        data-bs-toggle="tooltip"
        data-bs-placement="right"
        title="Click to download graph data"
      >
        Download Graph
      </a>
    </span>
  );
}
