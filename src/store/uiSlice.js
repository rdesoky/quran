import { createSlice } from "@reduxjs/toolkit";

const sliceName = "ui";

const initSidebarCommands = [
    // "AudioPlayer",
    "Indices",
    "Search",
    "Exercise",
    "Mask",
    "update_hifz",
    "Tafseer",
    "Bookmarks",
    "Goto",
    "Copy",
    // "Share",
    "Help",
];

const initialState = {
    modalPopup: false,
    menuExpanded: false,

    toastMessage: null,
    toastTime: 2000,

    showPopup: false, //show/hide flag ( used for transitioning purpose )
    popup: null, //modal popup component
    popupParams: {},

    recentCommands: initSidebarCommands,
    updateAvailable: false,
};

const slice = createSlice({
    name: sliceName,
    initialState,
    reducers: {
        showToast: (slice, { payload: { id, time = 2000 } }) => {
            slice.toastMessage = id;
            slice.toastTime = time;
        },
        setShowPopup: (slice, action) => {
            slice.showPopup = action.payload;
        },
        setPopup: (slice, action) => {
            slice.popup = action.payload;
        },
        setPopupParams: (slice, action) => {
            slice.popupParams = action.payload;
        },
        setUpdateAvailable: (slice, action) => {
            slice.updateAvailable = action.payload;
        },

        showMenu: (slice, { payload = false }) => {
            slice.menuExpanded = payload;
        },
        hideMenu: (slice) => {
            slice.menuExpanded = false;
        },
        toggleMenu: (slice) => {
            slice.menuExpanded = !slice.menuExpanded;
        },
        addRecentCommand: (slice, { payload }) => {
            slice.recentCommands = [payload, ...slice.recentCommands];
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
    showToast,
    setUpdateAvailable,
} = slice.actions;

export const selectRecentCommands = (state) => state[sliceName].recentCommands;
export const selectMessageBox = (state) =>
    state[sliceName].messageBox?.[state[sliceName].messageBox.length];
export const selectMenuExpanded = (state) => state[sliceName].menuExpanded;
export const selectShowPopup = (state) => state[sliceName].showPopup;
export const selectPopup = (state) => state[sliceName].popup;
export const selectIsExercisePopupOn = (state) =>
    state[sliceName].popup === "Exercise";
export const selectPopupParams = (state) => state[sliceName].popupParams;
export const selectToastMessage = (state) => ({
    id: state[sliceName].toastMessage,
    time: state[sliceName].toastTime,
});

export const selectSidebarWidth = (state) =>
    state[sliceName].isNarrow ? 0 : 50;

export const selectUpdateAvailable = (state) =>
    state[sliceName].updateAvailable;

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

// eslint-disable-next-line import/no-anonymous-default-export
export default { [sliceName]: slice.reducer };
