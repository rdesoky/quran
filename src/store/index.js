import { configureStore } from "@reduxjs/toolkit";
import appSlice from "./appSlice";
import uiSlice from "./uiSlice";
import settingsSlice from "./settingsSlice";
import userSlice from "./userSlice";

export const store = configureStore({
    reducer: {
        ...appSlice,
        ...settingsSlice,
        ...userSlice,
        ...uiSlice
    },
});
