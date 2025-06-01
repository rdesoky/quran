import { createSlice } from "@reduxjs/toolkit";
import {
    selectPagesCount,
    selectViewCapacity,
    selectZoom,
    ViewCapacity,
} from "./layoutSlice";

const sliceName = "ui";

const initSidebarCommands = [
    // "AudioPlayer",
    "Profile",
    "Indices",
    "Search",
    "Exercise",
    "Mask",
    "update_hifz",
    "Tafseer",
    "Bookmarks",
    "Goto",
    "Copy",
    "Share",
    "Help",
    "Settings",
];

const initialState = {
    menuExpanded: false,

    toastMessage: {
        id: null,
        time: 2000
    },

    showPopup: false, //show/hide flag ( used for transitioning purpose )
    popup: null, //modal popup component
    popupParams: {},

    modalPopup: false, //used to block user interaction outside the active popup

    recentCommands: initSidebarCommands,
    updateAvailable: false,

    suraNames: [],
};

const slice = createSlice({
    name: sliceName,
    initialState,
    reducers: {
        showToast: (slice, { payload: { id, time = 2000 } }) => {
            slice.toastMessage.id = id;
            slice.toastMessage.time = time;
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
        setModalPopup: (slice, action) => {
            slice.modalPopup = action.payload;
        },
        setSuraNames: (slice, action) => {
            slice.suraNames = action.payload;
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
    setModalPopup,
    setSuraNames,
} = slice.actions;

export const selectModalPopup = (state) => state[sliceName].modalPopup;
const recentCommands = [];
export const selectRecentCommands = (state) => {
    const filtered = state[sliceName].recentCommands.filter(
        (c) => c !== "Share" || navigator.share !== undefined
    );
    recentCommands.splice(0, recentCommands.length, ...filtered);
    return recentCommands;
}
export const selectMessageBox = (state) =>
    state[sliceName].messageBox?.[state[sliceName].messageBox.length];
export const selectMenuExpanded = (state) => state[sliceName].menuExpanded;
export const selectShowPopup = (state) => state[sliceName].showPopup;
export const selectPopup = (state) => state[sliceName].popup;
export const selectIsExercisePopupOn = (state) =>
    state[sliceName].popup === "Exercise";
export const selectPopupParams = (state) => state[sliceName].popupParams;
export const selectToastMessage = (state) => (state[sliceName].toastMessage);

export const selectSidebarWidth = (state) =>
    state[sliceName].isNarrow ? 0 : 50;

export const selectUpdateAvailable = (state) =>
    state[sliceName].updateAvailable;

export const selectSuraNames = (state) => state[sliceName].suraNames;

export const showPopup = (popup, params) => (dispatch, getState) => {
    const state = getState();
    const currentPopup = selectPopup(state);
    const menuExpanded = selectMenuExpanded(state);
    if (menuExpanded) {
        dispatch(hideMenu());
    }
    if (currentPopup) {
        dispatch(setShowPopup(false));
        //Animation trick
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

export const closePopupIfBlocking = () => (dispatch, getState) => {
    const state = getState();
    const popup = selectPopup(state);
    if (!popup) {
        return false;
    }
    const pagesCount = selectPagesCount(state);
    if (pagesCount === 2) {
        return; //
    }
    if (pagesCount === 1) {
        const viewCapacity = selectViewCapacity(state);
        const zoom = selectZoom(state);
        if (viewCapacity === ViewCapacity.onePagePlus && zoom === 0) {
            return false; //popup is not blocking
        }
    }
    dispatch(closePopup());
    return true;
};

// eslint-disable-next-line import/no-anonymous-default-export
export default { [sliceName]: slice.reducer };
