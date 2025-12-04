import { configureStore } from "@reduxjs/toolkit";
import dataReducer from "../dataSlice";

export default configureStore({
  reducer: { data: dataReducer },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      actionCreatorCheck: false,
      immutableStateCheck: false,
      serializableCheck: false,
    }),
});
