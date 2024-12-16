import { createSlice } from "@reduxjs/toolkit";

export const dataSlice = createSlice({
  name: "data",
  initialState: {
    formData: [1, 1, 1, 1],
  },
  reducers: {
    setData: (state, data) => {
      state.formData = data.payload;
    },
  },
});

export const { setData } = dataSlice.actions;

export default dataSlice.reducer;
