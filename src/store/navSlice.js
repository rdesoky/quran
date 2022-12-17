import {createSlice} from "@reduxjs/toolkit";

const sliceName = "nav";


const initialState = {
  selectStart: 0,
  selectEnd: 0,
  maskStart: -1,
};

const navSlice = createSlice({
  name: sliceName,
  initialState,
  reducers: {},
});


export const {onResize} = navSlice.actions;

export default {[sliceName]: navSlice.reducer};
