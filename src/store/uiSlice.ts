import { createSlice } from "@reduxjs/toolkit";
import {
    selectPagesCount,
    selectViewCapacity,
    selectZoom,
    ViewCapacity,
} from "./layoutSlice";
import { AppDispatch, GetState, RootState } from "./config";

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
        time: 2000,
    },

    showPopup: false, //show/hide flag ( used for transitioning purpose )
    popup: null, //modal popup component
    popupParams: {},

    modalPopup: false, //used to block user interaction outside the active popup

    recentCommands: initSidebarCommands,
    updateAvailable: false,

    suraNames: [],

    isNarrow: false, //used to hide the sidebar in narrow screens
    // messageBox: [] as Msg[], //used to show messages in the bottom of the screen
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

export const selectModalPopup = (state: RootState) =>
    state[sliceName].modalPopup;
const recentCommands: string[] = [];
export const selectRecentCommands = (state: RootState) => {
    const filtered = state[sliceName].recentCommands.filter(
        (c) => c !== "Share" || navigator.share !== undefined
    );
    recentCommands.splice(0, recentCommands.length, ...filtered);
    return recentCommands;
};
//TODO: unused
// export const selectMessageBox = (state: RootState) =>
//     state[sliceName].messageBox[state[sliceName].messageBox.length - 1];
export const selectMenuExpanded = (state: RootState) =>
    state[sliceName].menuExpanded;
export const selectShowPopup = (state: RootState) => state[sliceName].showPopup;
export const selectPopup = (state: RootState) => state[sliceName].popup;
export const selectIsExercisePopupOn = (state: RootState) =>
    state[sliceName].popup === "Exercise";
export const selectPopupParams = (state: RootState) =>
    state[sliceName].popupParams;
export const selectToastMessage = (state: RootState) =>
    state[sliceName].toastMessage;

export const selectSidebarWidth = (state: RootState) =>
    state[sliceName].isNarrow ? 0 : 50;

export const selectUpdateAvailable = (state: RootState) =>
    state[sliceName].updateAvailable;

export const selectSuraNames = (state: RootState) => state[sliceName].suraNames;

export const showPopup =
    (popup: string, params: Record<string, any>) =>
    (dispatch: AppDispatch, getState: GetState) => {
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

export const closePopup = () => (dispatch: AppDispatch) => {
    dispatch(setShowPopup(false));
    setTimeout(() => {
        dispatch(setPopup(null));
    }, 500);
};

export const closePopupIfBlocking =
    () => (dispatch: AppDispatch, getState: GetState) => {
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

export default { [sliceName]: slice.reducer };
