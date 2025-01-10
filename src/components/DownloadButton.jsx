import { useSelector } from "react-redux";

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

  return (
    <span>
      <a className="file-download" href={encodedUri} download={fileName}>
        Download Graph
      </a>
    </span>
  );
}
