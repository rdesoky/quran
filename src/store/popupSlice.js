import { createSlice } from "@reduxjs/toolkit";

const sliceName = "popups";

const initialState = {
    toastMessage: null,
    expandedMenu: false,
    modalPopup: false,
    messageBox: false,
    contextPopup: false,
    popup: null,
    popupParams: {},
    showPopup: false,
};

const popupSlice = createSlice({
    name: sliceName,
    initialState,
    reducers: {},
});

export default popupSlice;
