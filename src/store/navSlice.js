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

// export const {} = slice.actions;

export default { [sliceName]: slice.reducer };
export const selectRange = (state) => ({
  start: state[sliceName].selectStart,
  end: state[sliceName].selectEnd,
});

export const selectStart = (state) => state[sliceName].selectStart;
export const selectEnd = (state) => state[sliceName].selectEnd;
export const selectMaskStart = (state) => state[sliceName].maskStart;
