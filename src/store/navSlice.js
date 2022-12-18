import { createSlice } from "@reduxjs/toolkit";

const sliceName = "nav";

const initialState = {
  selectStart: 0,
  selectEnd: 0,
  maskStart: -1,
};

const slice = createSlice({
  name: sliceName,
  initialState,
  reducers: {},
});

export const {} = slice.actions;

export default { [sliceName]: slice.reducer };
