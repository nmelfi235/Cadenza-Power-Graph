import { createSlice } from "@reduxjs/toolkit";

class Goal {
  static goal_count = 0;

  constructor({ StartTime, EndTime, PowerLevel }) {
    this.ID = Goal.goal_count++;
    this.StartTime = StartTime;
    this.EndTime = EndTime;
    this.PowerLevel = parseInt(PowerLevel);
  }

  valueOf() {
    return this.PowerLevel;
  }

  toString() {
    return `Goal(${this.StartTime}, ${this.EndTime}, ${this.PowerLevel})`;
  }
}

export const convertToTimestamp = (time) => {
  return String(time[0]) + ":" + String(time[1]);
};

export const convertToArray = (time) => {};

export const initialGoalState = new Goal({
  StartTime: "00:00", // Default: 0 Hours, 0 Minutes (00:00 AM)
  EndTime: "23:59", // Default: 23 Hours, 59 Minutes (11:59 PM)
  PowerLevel: 5, // kW
});

export const goalSlice = createSlice({
  name: "goals",
  initialState: {
    goals: [],
    currentGoal: {}, //initialGoalState,
  },
  reducers: {
    addGoal: (state, data) => {
      state.goals.push(new Goal(data.payload));
      state.currentGoal = {};
    },
    removeGoal: (state, data) => {
      state.goals = state.goals.filter(
        (goal) => goal["ID"] !== data.payload["ID"],
      );
      state.currentGoal = {};
    },
    setCurrentGoal: (state, data) => {
      state.currentGoal = { ...data.payload };
    },
    editGoal: (state, data) => {
      const goal = state.goals.find(
        (goal) => goal["ID"] === data.payload["ID"],
      );
      Object.assign(goal, data.payload);
    },
  },
});

export const { addGoal, removeGoal, setCurrentGoal, editGoal } =
  goalSlice.actions;

export default goalSlice.reducer;
