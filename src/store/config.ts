import { configureStore } from "@reduxjs/toolkit";
import appSlice from "@/store/layoutSlice";
import uiSlice from "@/store/uiSlice";
import settingsSlice from "@/store/settingsSlice";
import dbSlice from "@/store/dbSlice";
import navSlice from "@/store/navSlice";
import playerSlice from "@/store/playerSlice";

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
