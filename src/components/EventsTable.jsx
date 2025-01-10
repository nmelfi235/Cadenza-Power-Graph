import { useDispatch, useSelector } from "react-redux";
import { setEventTable } from "../dataSlice.js";

const colWidth = 200,
  rowHeight = 20;

function InfoTable() {
  const events = useSelector((state) => state.data.events);
  const dispatch = useDispatch();

  const deleteRow = (e, id) => {
    dispatch(setEventTable(events.filter((d) => d.eventID !== id)));
  };

  return (
    <table className="table table-striped">
      <thead>
        <tr>
          <td style={{ width: colWidth / 4, height: rowHeight }}></td>
          <td style={{ width: colWidth, height: rowHeight }}>Event Type</td>
          <td style={{ width: colWidth, height: rowHeight }}>Start Time</td>
          <td style={{ width: colWidth, height: rowHeight }}>End Time</td>
          <td style={{ width: colWidth, height: rowHeight }}>Power Level</td>
        </tr>
      </thead>
      <tbody>
        {(() => {
          const rows = [];
          let index = 0;
          for (const event of events) {
            rows.push(
              <tr key={event.eventID}>
                {(() => {
                  const cols = [];
                  cols.push(
                    <td key="del-icon">
                      <i
                        className="fa-solid fa-trash delete-event-button"
                        style={{ width: colWidth / 4, height: rowHeight }}
                        index={index}
                        onClick={(e) => deleteRow(e, event.eventID)}
                      ></i>
                    </td>
                  );
                  for (const info in event) {
                    if (info === "eventID") continue;
                    cols.push(
                      <td
                        key={info}
                        style={{ width: colWidth, height: rowHeight }}
                      >
                        {event[info]}
                      </td>
                    );
                  }
                  return cols;
                })()}
              </tr>
            );
            index++;
          }
          return rows;
        })()}
      </tbody>
    </table>
  );
}

export default function EventsTable({ className, style }) {
  return (
    <div className={className} style={style}>
      <div className="d-flex flex-row align-items-center">
        <button className="add-event">+</button>
        <h2>Events</h2>
      </div>
      <InfoTable />
    </div>
  );
}
