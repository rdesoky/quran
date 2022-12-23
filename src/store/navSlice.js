import { createSlice } from "@reduxjs/toolkit";
import { quranText } from "../App";
import {
    ayaID,
    ayaIdInfo,
    ayaIdPage,
    getPageFirstAyaId,
    parts,
    TOTAL_PAGES,
    TOTAL_PARTS,
    TOTAL_SURAS,
    TOTAL_VERSES,
} from "../services/QData";
import { greaterOf, lesserOf } from "../services/utils";
import { selectActivePage } from "./layoutSlice";

const sliceName = "nav";

const initialState = {
    selectStart: 0,
    selectEnd: 0,
    maskOn: false,
    maskShift: 0,
};

const slice = createSlice({
    name: sliceName,
    initialState,
    reducers: {
        setSelectStart: (slice, action) => {
            slice.selectStart = action.payload;
        },
        setSelectEnd: (slice, action) => {
            slice.selectEnd = action.payload;
        },
        showMask: (slice) => {
            slice.maskOn = true;
            slice.maskShift = 0;
        },
        hideMask: (slice) => {
            slice.maskOn = false;
            slice.maskShift = 0;
        },
        setMaskShift: (slice, action) => {
            slice.maskShift = action.payload;
        },
    },
});

// eslint-disable-next-line import/no-anonymous-default-export
export default { [sliceName]: slice.reducer };

export const {
    setSelectStart,
    setSelectEnd,
    showMask,
    hideMask,
    setMaskShift,
} = slice.actions;

//selectors
export const selectSelectedRange = (state) => ({
    start: lesserOf(state[sliceName].selectStart, state[sliceName].selectEnd),
    end: greaterOf(state[sliceName].selectEnd, state[sliceName].selectStart),
});

export const selectStartSelection = (state) => state[sliceName].selectStart;
export const selectEndSelection = (state) => state[sliceName].selectEnd;
export const selectMaskStart = (state) =>
    state[sliceName].maskOn
        ? lesserOf(state[sliceName].selectStart, state[sliceName].selectEnd) +
          state[sliceName].maskShift
        : -1;
export const selectMaskShift = (state) => state[sliceName].maskShift;
export const selectSelectedText = (state) => {
    //TODO: slow selector
    let { selectStart, selectEnd } = state[sliceName];
    if (selectStart > selectEnd) {
        [selectStart, selectEnd] = [selectEnd, selectStart]; //reverse
    }
    const verses = quranText.slice(selectStart, selectEnd + 1).map((t, i) => {
        const { sura, aya } = ayaIdInfo(selectStart + i);
        return `${t} (${sura + 1}:${aya + 1})`;
    });

    return verses.join(" ");
};

//thunks
export const gotoAya =
    (history, ayaId, options = {}) =>
    (dispatch, getState) => {
        const { sel = true, replace = true } = options;
        const state = getState();
        if (ayaId === undefined) {
            ayaId = selectStartSelection(state);
        }
        if (sel) {
            dispatch(setSelectStart(ayaId));
            dispatch(setSelectEnd(ayaId));
        }
        const pageIndex = ayaIdPage(ayaId);
        dispatch(gotoPage(history, { index: pageIndex, replace, sel: false }));
    };

export const gotoPage =
    (history, { index: pageIndex, sel: select = false, replace = true }) =>
    (dispatch, getState) => {
        const selectPageAya = () => {
            if (select) {
                const verse = getPageFirstAyaId(pageIndex);
                dispatch(selectAya(verse));
            }
        };
        if (selectActivePage(getState()) === pageIndex) {
            //already on that page
            selectPageAya();
            return;
        }
        if (pageIndex < TOTAL_PAGES && pageIndex >= 0) {
            let targetPath = `${process.env.PUBLIC_URL}/page/${pageIndex + 1}`;
            if (replace) {
                history.replace(targetPath);
            } else {
                history.push(targetPath);
                // analytics.logEvent("page_view");
            }
            selectPageAya();
        }
    };

export const offsetPage = (history, offset) => (dispatch, getState) => {
    const pageIndex = selectActivePage(getState());
    if (pageIndex !== undefined) {
        const nextPageIndex = pageIndex + offset;
        dispatch(gotoPage(history, { index: nextPageIndex }));
    }
};

export const nextPage = (history) => (dispatch) => {
    dispatch(offsetPage(history, 1));
};

export const prevPage = (history) => (dispatch) => {
    dispatch(offsetPage(history, -1));
};

export const gotoSura = (history, suraIndex) => (dispatch) => {
    if (suraIndex >= TOTAL_SURAS) {
        return 0;
    }
    const ayaId = ayaID(parseInt(suraIndex), 0);
    dispatch(gotoAya(history, ayaId, { sel: true }));
    return ayaId;
};

export const gotoPart = (history, partIndex) => (dispatch) => {
    if (partIndex < 0 || partIndex >= TOTAL_PARTS) {
        return 0;
    }
    const partInfo = parts[partIndex];
    const ayaId = ayaID(partInfo.s - 1, partInfo.a - 1);
    dispatch(gotoAya(history, ayaId, { sel: true }));
};

export const offsetSelection = (offset) => (dispatch, getState) => {
    const selectStart = selectStartSelection(getState());
    let newSelectionId = dispatch(selectAya(selectStart + offset));
    return newSelectionId !== undefined ? newSelectionId : selectStart;
};

export const extendSelection = (ayaId) => (dispatch, getState) => {
    const selectStart = selectStartSelection(getState());
    if (ayaId < 0 || ayaId >= TOTAL_VERSES) {
        return selectStart;
    }
    if (ayaId === selectStart) {
        dispatch(selectAya(ayaId)); //reset start and end selection
    } else {
        dispatch(setSelectStart(ayaId)); //set start selection and keep end selection as is
    }
    return ayaId;
};

export const selectAya = (ayaId) => (dispatch, getState) => {
    let targetAya =
        ayaId !== undefined ? ayaId : selectStartSelection(getState());

    if (targetAya < 0) {
        targetAya = TOTAL_VERSES - 1;
    }
    if (targetAya >= TOTAL_VERSES) {
        targetAya = 0;
    }

    dispatch(setSelectStart(targetAya));
    dispatch(setSelectEnd(targetAya));

    return targetAya;
};

// export const setMaskStart =
//     (ayaId, keepSelection = false) =>
//     (dispatch, getState) => {
//         if (ayaId === undefined) {
//             const state = getState();
//             const selectStart = selectStartSelection(state);
//             const selectEnd = selectEndSelection(state);
//             const maskStart = selectMaskStart(state);
//             if (maskStart !== -1) {
//                 dispatch(hideMask());
//                 return;
//             }

//             ayaId = selectStart < selectEnd ? selectStart : selectEnd;
//         }

//         dispatch(showMask(ayaId));
//         if (!keepSelection) {
//             dispatch(setSelectStart(ayaId));
//             dispatch(setSelectEnd(ayaId));
//         }
//     };

// export const offsetMask = (offset) => (dispatch, getState) => {
//     const state = getState();
//     const popup = selectPopup(state);
//     if (popup === "Exercise") {
//         dispatch(offsetSelection(offset));
//         return;
//     }
//     const ms = selectMaskStart(state);
//     if (ms !== -1) {
//         const maskStart = ms + offset;
//         if (maskStart >= 0 && maskStart < TOTAL_VERSES) {
//             dispatch(setMaskStart(maskStart));
//         }
//     }
// };
