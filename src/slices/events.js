import { createSlice } from "@reduxjs/toolkit";

let event_count = 0;
function Event({ EventType, StartTime, EndTime, PowerLevel }) {
  this.ID = event_count++;
  this.EventType = EventType;
  this.StartTime = StartTime;
  this.EndTime = EndTime;
  this.PowerLevel = PowerLevel;
}

export const initialEventState = new Event({
  EventType: "Discharge",
  StartTime: "00:00",
  EndTime: "23:59",
  PowerLevel: 5,
});

export const EventTypes = ["Charge", "Discharge", "Timeblock"];

export const eventSlice = createSlice({
  name: "events",
  initialState: {
    events: [],
    currentEvent: {},
  },
  reducers: {
    addEvent: (state, data) => {
      state.events.push(new Event(data.payload));
      state.currentEvent = {};
    },
    removeEvent: (state, data) => {
      state.events = state.events.filter(
        (event) => event["ID"] !== data.payload["ID"],
      );
      state.currentEvent = {};
    },
    setCurrentEvent: (state, data) => {
      state.currentEvent = { ...data.payload };
    },
    editEvent: (state, data) => {
      const event = state.events.find(
        (event) => event["ID"] === data.payload["ID"],
      );
      Object.assign(event, data.payload);
    },
  },
});

export const { addEvent, removeEvent, setCurrentEvent, editEvent } =
  eventSlice.actions;

export default eventSlice.reducer;
