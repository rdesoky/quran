import {createSlice} from "@reduxjs/toolkit";

const sliceName = "ui";

const initialState = {
  toastMessage: null,
  showMenu: false,

  modalPopup: false,
  messageBox: false,
  contextPopup: false,
  popup: null,//modal popup component
  popupParams: {},
  showPopup: false,//modal popup
  messageBoxInfo: []
};

const uiSlice = createSlice({
  name: sliceName,
  initialState,
  reducers: {
    closePopup: (slice) => {
      slice.popup = null;
      slice.showPopup = false;
    },
    showPopup: (slice, {payload: {popup, params}}) => {
      slice.popup = popup;
      slice.popupParams = params;
      slice.showMenu = false;
      slice.showPopup = true;
    },
    showMenu: (slice) => {
      slice.showMenu = true;
    },
    hideMenu: (slice) => {
      slice.showMenu = false;
    },
    toggleMenu: (slice) => {
      slice.showMenu = !slice.showMenu;
    },
  },
});

export const {closePopup, showMenu, hideMenu, toggleMenu, showPopup} = uiSlice.actions;

export const selectMessageBox = (state) => state[sliceName].messageBox?.[state[sliceName].messageBox.length];
export const selectShowMenu = (state) => state[sliceName].showMenu;
export const selectShowPopup = (state) => state[sliceName].showPopup;
export const selectPopup = (state) => state[sliceName].popup;
export const selectPopupParams = (state) => state[sliceName].popupParams;

export default {[sliceName]: uiSlice.reducer};
