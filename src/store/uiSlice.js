import { createSlice } from "@reduxjs/toolkit";

const sliceName = "ui";

const initialState = {
  toastMessage: null,
  showMenu: false,

  modalPopup: false,
  messageBox: false,
  contextPopup: false,

  showPopup: false, //show/hide flag ( used for transitioning purpose )
  popup: null, //modal popup component
  popupParams: {},

  messageBoxInfo: [],
};

const uiSlice = createSlice({
  name: sliceName,
  initialState,
  reducers: {
    setShowPopup: (slice, action) => {
      slice.showPopup = action.payload;
    },
    setPopup: (slice, action) => {
      slice.popup = action.payload;
    },
    setPopupParams: (slice, action) => {
      slice.popupParams = action.payload;
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

export const {
  showMenu,
  hideMenu,
  toggleMenu,
  setPopup,
  setPopupParams,
  setShowPopup,
} = uiSlice.actions;

export const selectMessageBox = (state) =>
  state[sliceName].messageBox?.[state[sliceName].messageBox.length];
export const selectShowMenu = (state) => state[sliceName].showMenu;
export const selectShowPopup = (state) => state[sliceName].showPopup;
export const selectPopup = (state) => state[sliceName].popup;
export const selectPopupParams = (state) => state[sliceName].popupParams;

export const selectSidebarWidth = (state) =>
  state[sliceName].isNarrow ? 0 : 50;

export const showPopup = (popup, params) => (dispatch, getState) => {
  const {
    [sliceName]: { popup: currentPopup },
  } = getState();
  if (currentPopup) {
    dispatch(setShowPopup(false));
    setTimeout(() => {
      if (currentPopup === popup) {
        dispatch(setPopup(null));
        dispatch(setPopupParams(null));
      } else {
        //show new popup
        dispatch(setPopup(popup));
        dispatch(setPopupParams(params));
        dispatch(setShowPopup(true));
      }
    }, 500);
  } else {
    dispatch(setPopup(popup));
    dispatch(setPopupParams(params));
    dispatch(setShowPopup(true));
  }
};

export const closePopup = () => (dispatch) => {
  dispatch(setShowPopup(false));
  setTimeout(() => {
    dispatch(setPopup(null));
  }, 500);
};

export default { [sliceName]: uiSlice.reducer };
