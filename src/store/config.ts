import { configureStore } from "@reduxjs/toolkit";
import appSlice from "./layoutSlice";
import uiSlice from "./uiSlice";
import settingsSlice from "./settingsSlice";
import dbSlice from "./dbSlice";
import navSlice from "./navSlice";
import playerSlice from "./playerSlice";

export const store = configureStore({
    reducer: {
        ...appSlice,
        ...settingsSlice,
        ...dbSlice,
        ...uiSlice,
        ...navSlice,
        ...playerSlice,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type GetState = () => RootState;
