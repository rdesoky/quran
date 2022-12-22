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
import { getCurrentPageNumber } from "../services/utils";
import { selectPopup } from "./uiSlice";

const sliceName = "nav";

const initialState = {
    selectStart: 0,
    selectEnd: 0,
    maskStart: -1,
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
        setMask: (slice, action) => {
            slice.maskStart = action.payload;
        },
        hideMask: (slice) => {
            slice.maskStart = -1;
        },
    },
});

export default { [sliceName]: slice.reducer };

export const { setSelectStart, setSelectEnd, setMask, hideMask } =
    slice.actions;

//selectors
export const selectSelectedRange = (state) => ({
    start: state[sliceName].selectStart,
    end: state[sliceName].selectEnd,
});

export const selectStartSelection = (state) => state[sliceName].selectStart;
export const selectEndSelection = (state) => state[sliceName].selectEnd;
export const selectMaskStart = (state) => state[sliceName].maskStart;
export const selectSelectedText = (state) => {
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
        const { sel = false, replace = true, keepMask = false } = options;
        const state = getState();
        if (ayaId === undefined) {
            ayaId = selectStartSelection(state);
        }
        if (sel) {
            dispatch(setSelectStart(ayaId));
            dispatch(setSelectEnd(ayaId));
            if (keepMask !== true) {
                dispatch(hideMask());
            }
        }
        const pageIndex = ayaIdPage(ayaId);
        dispatch(gotoPage(history, { index: pageIndex, replace, sel: false }));
    };

export const gotoPage =
    (history, { index: pageIndex, sel: select = true, replace = true }) =>
    (dispatch) => {
        const selectPageAya = () => {
            if (select) {
                const verse = getPageFirstAyaId(pageIndex);
                dispatch(selectAya(verse));
            }
        };
        if (getCurrentPageNumber() === pageIndex + 1) {
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
    const pageIndex = getCurrentPageNumber() - 1;
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
        dispatch(selectAya(ayaId)); //select backwards
    } else {
        dispatch(setSelectStart(ayaId));
    }
    return ayaId;
};

export const selectAya = (ayaId) => (dispatch, getState) => {
    const targetAya = ayaId || selectStartSelection(getState());
    if (targetAya < TOTAL_VERSES) {
        dispatch(setSelectStart(targetAya));
        dispatch(setSelectEnd(targetAya));
        dispatch(hideMask());
        return targetAya;
    }
    return ayaId;
};

export const setMaskStart =
    (ayaId, keepSelection = false) =>
    (dispatch, getState) => {
        if (ayaId === undefined) {
            const state = getState();
            const selectStart = selectStartSelection(state);
            const selectEnd = selectEndSelection(state);
            const maskStart = selectMaskStart(state);
            if (maskStart !== -1) {
                dispatch(hideMask());
                return;
            }

            ayaId = selectStart < selectEnd ? selectStart : selectEnd;
        }

        dispatch(setMask(ayaId));
        if (!keepSelection) {
            dispatch(setSelectStart(ayaId));
            dispatch(setSelectEnd(ayaId));
        }
    };

export const offsetMask = (offset) => (dispatch, getState) => {
    const state = getState();
    const popup = selectPopup(state);
    if (popup === "Exercise") {
        dispatch(offsetSelection(offset));
        return;
    }
    const ms = selectMaskStart(state);
    if (ms !== -1) {
        const maskStart = ms + offset;
        if (maskStart >= 0 && maskStart < TOTAL_VERSES) {
            dispatch(setMaskStart(maskStart));
        }
    }
};
