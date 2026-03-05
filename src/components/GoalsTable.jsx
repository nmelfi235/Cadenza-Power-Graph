import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  initialGoalState,
  addGoal,
  removeGoal,
  editGoal,
} from "../slices/goals";

export const GoalsTable = ({
  className,
  style,
  colWidth = 10,
  rowHeight = 10,
}) => {
  return (
    <div className={className} style={style}>
      <h2>Goals</h2>
      <div className="table-responsive">
        <table className="table table-striped table-sm table-hover">
          <thead>
            <tr>
              <th style={{ width: colWidth / 4, height: rowHeight }}> </th>
              <th
                className="w-25"
                style={{ width: colWidth, height: rowHeight }}
              >
                Start Time
              </th>
              <th
                className="w-25"
                style={{ width: colWidth, height: rowHeight }}
              >
                End Time
              </th>
              <th
                className="w-auto"
                style={{ width: colWidth, height: rowHeight }}
              >
                Power Level
              </th>
            </tr>
          </thead>
          <tbody>
            <TableRows colWidth={colWidth} rowHeight={rowHeight} />
            <GoalSelector colWidth={colWidth} rowHeight={rowHeight} />
          </tbody>
        </table>
      </div>
    </div>
  );
};

const GoalSelector = ({ colWidth = 10, rowHeight = 10 }) => {
  const [rowState, setRowState] = useState(initialGoalState);
  const dispatch = useDispatch();

  const handleChange = (e) => {
    e.preventDefault();
    const { name, value } = e.target;
    let newState = { ...rowState };
    newState[name] = value;
    setRowState(newState);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(addGoal(rowState));
  };

  return (
    <tr>
      <td style={{ width: colWidth / 4, height: rowHeight }}>
        <button type="button" className="btn" onClick={handleSubmit}>
          <i className="fa-solid fa-plus"></i>
        </button>
      </td>
      <td>
        <input
          type="time"
          className="form-control"
          defaultValue={rowState["StartTime"]}
          onChange={handleChange}
          name="StartTime"
        />
      </td>
      <td>
        <input
          type="time"
          className="form-control"
          defaultValue={rowState["EndTime"]}
          onChange={handleChange}
          name="EndTime"
        />
      </td>
      <td className="d-flex flex-row">
        <input
          type="number"
          step="any"
          className="form-control"
          defaultValue={rowState["PowerLevel"]}
          onChange={handleChange}
          name="PowerLevel"
        />
        <div className="input-group-text">kW</div>
      </td>
    </tr>
  );
};

const Row = ({ colWidth = 10, rowHeight = 10, goal }) => {
  const [rowState, setRowState] = useState({ ...goal, editing: false });
  const dispatch = useDispatch();

  const deleteRow = (e) => {
    dispatch(removeGoal({ ID: goal.ID }));
  };

  const editRow = (e) => {
    setRowState({ ...rowState, editing: true });
  };

  const handleChange = (e) => {
    e.preventDefault();
    const { name, value } = e.target;
    let newState = { ...rowState };
    newState[name] = value;
    setRowState(newState);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(editGoal(rowState));
    setRowState({ ...rowState, editing: false });
  };

  return (
    <tr>
      <td style={{ width: colWidth / 4, height: rowHeight }}>
        <div className="d-flex flex-row">
          <button type="button" className="btn" onClick={deleteRow}>
            <i
              className="fa-solid fa-trash"
              style={{ width: colWidth / 4, height: rowHeight }}
              index={goal.ID}
            ></i>
          </button>
          <button
            type="button"
            className="btn"
            onClick={rowState.editing ? handleSubmit : editRow}
          >
            <i
              className={
                rowState.editing ? "fa-solid fa-check" : "fa-solid fa-pencil"
              }
              style={{ width: colWidth / 4, height: rowHeight }}
              index={goal.ID}
            ></i>
          </button>
        </div>
      </td>
      {rowState.editing ? (
        <td>
          <input
            type="time"
            className="form-control"
            defaultValue={rowState["StartTime"]}
            onChange={handleChange}
            name="StartTime"
          />
        </td>
      ) : (
        <td className="px-3 py-2">{goal["StartTime"]}</td>
      )}
      {rowState.editing ? (
        <td>
          <input
            type="time"
            className="form-control"
            defaultValue={rowState["EndTime"]}
            onChange={handleChange}
            name="EndTime"
          />
        </td>
      ) : (
        <td className="px-3 py-2">{goal["EndTime"]}</td>
      )}
      {rowState.editing ? (
        <td className="d-flex flex-row">
          <input
            type="number"
            step="any"
            className="form-control"
            defaultValue={rowState["PowerLevel"]}
            onChange={handleChange}
            name="PowerLevel"
          />
          <div className="input-group-text">kW</div>{" "}
        </td>
      ) : (
        <td className="px-3 py-2">
          {goal["PowerLevel"]} <span className="float-end">kW</span>
        </td>
      )}
    </tr>
  );
};

const TableRows = ({ colWidth = 10, rowHeight = 10 }) => {
  const goals = useSelector((state) => state.goals.goals);

  return (
    <>
      {goals.map((goal, index) => (
        <Row
          colWidth={colWidth}
          rowHeight={rowHeight}
          goal={goal}
          key={index}
        />
      ))}
    </>
  );
};
