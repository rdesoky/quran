import { configureStore } from "@reduxjs/toolkit";
import appSlice from "./layoutSlice";
import uiSlice from "./uiSlice";
import settingsSlice from "./settingsSlice";
import userSlice from "./userSlice";

export const store = configureStore({
  reducer: {
    ...appSlice,
    ...settingsSlice,
    ...userSlice,
    ...uiSlice,
  },
});
