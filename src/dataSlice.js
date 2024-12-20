import { createSlice } from "@reduxjs/toolkit";

export const dataSlice = createSlice({
  name: "data",
  initialState: {
    formData: [
      { date: "01-01-1971", power: 1 },
      { date: "01-02-1971", power: 1 },
    ],
  },
  reducers: {
    setData: (state, data) => {
      state.formData = data.payload;
    },
  },
});

export const { setData } = dataSlice.actions;

export default dataSlice.reducer;
