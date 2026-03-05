import { configureStore } from "@reduxjs/toolkit";
import dataReducer from "../dataSlice";
import goalReducer from "../slices/goals";
import eventReducer from "../slices/events";

export default configureStore({
  reducer: { data: dataReducer, goals: goalReducer, events: eventReducer },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      actionCreatorCheck: false,
      immutableStateCheck: false,
      serializableCheck: false,
    }),
});
