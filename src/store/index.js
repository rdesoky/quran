import { configureStore } from "@reduxjs/toolkit";
import appSlice from "./appSlice";
import popupSlice from "./popupSlice";
import settingsSlice from "./settingsSlice";
import userSlice from "./userSlice";

export const store = configureStore({
    reducer: {
        app: appSlice.reducer,
        settings: settingsSlice.reducer,
        user: userSlice.reducer,
        popup: popupSlice.reducer,
    },
});
