import { useDispatch, useSelector } from "react-redux";
import { setEventTable, insertEvent } from "../dataSlice.js";
import { useRef, useEffect, useState } from "react";

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

function Modal({ openModal, closeModal }) {
  const [eventType, setEventType] = useState("Charge");
  const ref = useRef();
  const dispatch = useDispatch();

  useEffect(() => {
    if (openModal) {
      ref.current?.showModal();
    } else {
      ref.current?.close();
    }
  }, [openModal]);

  const addNewEvent = (e) => {
    e.preventDefault();
    console.log(e.target["eventType"]);
    dispatch(
      insertEvent({
        eventType: e.target["eventType"].value,
        startTime: e.target["startTime"].value,
        endTime: e.target["endTime"].value,
        powerLevel: e.target["powerLevel"].value,
      })
    );
    closeModal();
  };

  const handleEventChange = (e) => {
    e.target.classList.toggle("active");
    setEventType(e.target.value);
  };

  return (
    <dialog ref={ref} onCancel={closeModal} className="rounded border-0 w-75">
      <div className="d-flex flex-column justify-content-left">
        <h1>New Event</h1>
        <form
          onSubmit={addNewEvent}
          className="d-flex flex-column justify-content-left"
        >
          <label>Event Type:</label>
          <div id="event-type-input" className="btn-group">
            <button
              type="button"
              className={
                eventType === "Charge"
                  ? "btn btn-primary active"
                  : "btn btn-primary"
              }
              value="Charge"
              onClick={() => setEventType("Charge")}
            >
              Charge
            </button>
            <input id="eventType" type="hidden" value={eventType} />
            <button
              type="button"
              className={
                eventType === "Discharge"
                  ? "btn btn-primary active"
                  : "btn btn-primary"
              }
              value="Discharge"
              onClick={() => setEventType("Discharge")}
            >
              Discharge
            </button>
          </div>
          <label htmlFor="power-input">Power Level:</label>
          <div className="input-group">
            <input
              id="power-input"
              className="form-control"
              type="number"
              name="powerLevel"
            ></input>
            <div className="input-group-text">kW</div>
          </div>
          <label htmlFor="start-time-input">Start Time:</label>
          <input
            id="start-time-input"
            className="form-control"
            type="time"
            defaultValue="00:00"
            name="startTime"
          ></input>
          <label htmlFor="end-time-input">End Time:</label>
          <input
            id="end-time-input"
            className="form-control"
            type="time"
            defaultValue="00:00"
            name="endTime"
          ></input>
          <div className="d-flex flex-row justify-content-left">
            <button type="submit" className="btn btn-primary">
              Submit
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={closeModal}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}

export default function EventsTable({ className, style, showModal }) {
  const [modal, setModal] = useState(false);
  const dialogRef = useRef(null);

  return (
    <div className={className} style={style}>
      <div className="d-flex flex-row align-items-center">
        <button className="add-event" onClick={() => setModal(true)}>
          <i className="fa-solid fa-plus"></i>
        </button>
        <h2>Events</h2>
      </div>
      <InfoTable />
      <Modal openModal={modal} closeModal={() => setModal(false)} />
    </div>
  );
}
