import { HistoryType } from "@/hooks/useHistory";
import { Action, createSlice } from "@reduxjs/toolkit";
import { quranText } from "@/data/quran";
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
} from "@/services/qData";
import { greaterOf, lesserOf } from "@/services/utils";
import { AppDispatch, GetState, RootState } from "@/store/config";
import {
	sliceName as layoutSliceName,
	selectActivePage,
	selectShownPages,
	setActivePageIndex,
} from "@/store/layoutSlice";
// import { History } from "history";

const sliceName = "nav";

const initialState = {
	selectStart: -1,
	selectEnd: -1,
	maskOn: false,
	maskShift: 0,
};

const slice = createSlice({
	name: sliceName,
	initialState,
	reducers: {
		setSelectedAya: (slice, action) => {
			slice.selectStart = slice.selectEnd = action.payload;
		},
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
	extraReducers: (builder) => {
		const setActivePageIndex = `${layoutSliceName}/setActivePageIndex`;
		type SetActivePageIndexAction = Action<typeof setActivePageIndex> & {
			payload: number;
		};

		builder.addCase(
			setActivePageIndex,
			(slice, action: SetActivePageIndexAction) => {
				if (slice.selectStart === -1) {
					slice.selectStart = getPageFirstAyaId(action.payload);
					slice.selectEnd = slice.selectStart;
				}
			}
		);
	},
});

export default { [sliceName]: slice.reducer };

export const {
	setSelectStart,
	setSelectEnd,
	showMask,
	hideMask,
	setMaskShift,
	setSelectedAya,
} = slice.actions;

//selectors
const selectedRange = { start: -1, end: -1 };
export const selectSelectedRange = (state: RootState) => {
	selectedRange.start = lesserOf(
		state[sliceName].selectStart,
		state[sliceName].selectEnd
	);
	selectedRange.end = greaterOf(
		state[sliceName].selectEnd,
		state[sliceName].selectStart
	);
	return selectedRange;
};

export const selectStartSelection = (state: RootState) =>
	state[sliceName].selectStart;
export const selectEndSelection = (state: RootState) =>
	state[sliceName].selectEnd;
export const selectMaskOn = (state: RootState) => state[sliceName].maskOn;
export const selectMaskStart = (state: RootState) =>
	state[sliceName].maskOn
		? lesserOf(state[sliceName].selectStart, state[sliceName].selectEnd) +
		state[sliceName].maskShift
		: -1;
export const selectMaskShift = (state: RootState) => state[sliceName].maskShift;
export const selectSelectedText = (state: RootState) => {
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
export const startMask =
	(history: HistoryType) => (dispatch: AppDispatch, getState: GetState) => {
		const state = getState();
		const shownPages = selectShownPages(state);
		const selectedAya = selectStartSelection(state);
		const selectedAyaPage = ayaIdPage(selectedAya);
		if (!shownPages.includes(selectedAyaPage)) {
			const firstVisibleAya = getPageFirstAyaId(shownPages[0]);
			dispatch(
				gotoAya(history, firstVisibleAya, { sel: true, replace: false })
			);
		} else {
			dispatch(setActivePageIndex(selectedAyaPage));
		}

		dispatch(showMask());
	};

export type GotoAyaOptions = {
	sel?: boolean; //select the aya
	replace?: boolean; //replace the history entry
};

export const gotoAya =
	(history: HistoryType, ayaId?: number, options: GotoAyaOptions = {}) =>
		(dispatch: AppDispatch, getState: GetState) => {
			const { sel = true, replace = true } = options;
			const state = getState();
			if (ayaId === undefined) {
				ayaId = selectStartSelection(state);
			}
			if (sel) {
				dispatch(setSelectedAya(ayaId));
			}
			const pageIndex = ayaIdPage(ayaId);
			dispatch(gotoPage(history, pageIndex, { replace, sel: false }));
		};

export const gotoPage =
	(
		history: HistoryType,
		pageIndex: number,
		{ sel: select = false, replace = true } = {}
	) =>
		(dispatch: AppDispatch, getState: GetState) => {
			const selectPageAya = () => {
				if (select) {
					const verse = getPageFirstAyaId(pageIndex);
					dispatch(setActivePageIndex(pageIndex));
					dispatch(selectAya(verse));
				}
			};
			if (selectActivePage(getState()) === pageIndex) {
				//already on that page
				selectPageAya();
				return;
			}
			if (pageIndex < TOTAL_PAGES && pageIndex >= 0) {
				const targetPath = `${import.meta.env.BASE_URL}page/${pageIndex + 1}`;
				if (replace) {
					history.replace(targetPath);
				} else {
					history.push(targetPath);
					// analytics.logEvent("page_view");
				}
				selectPageAya();
			}
		};

export const offsetPage =
	(history: HistoryType, offset: number) =>
		(dispatch: AppDispatch, getState: GetState) => {
			const pageIndex = selectActivePage(getState());
			if (pageIndex !== undefined) {
				const nextPageIndex = pageIndex + offset;
				dispatch(gotoPage(history, nextPageIndex));
			}
		};

export const nextPage = (history: HistoryType) => (dispatch: AppDispatch) => {
	dispatch(offsetPage(history, 1));
};

export const prevPage = (history: HistoryType) => (dispatch: AppDispatch) => {
	dispatch(offsetPage(history, -1));
};

export const gotoSura =
	(history: HistoryType, suraIndex: number) => (dispatch: AppDispatch) => {
		if (suraIndex >= TOTAL_SURAS) {
			return 0;
		}
		const ayaId = ayaID(suraIndex, 0);
		dispatch(gotoAya(history, ayaId, { sel: true }));
		return ayaId;
	};

export const gotoPart =
	(history: HistoryType, partIndex: number) => (dispatch: AppDispatch) => {
		if (partIndex < 0 || partIndex >= TOTAL_PARTS) {
			return 0;
		}
		const partInfo = parts[partIndex];
		const ayaId = ayaID(partInfo.s - 1, partInfo.a - 1);
		dispatch(gotoAya(history, ayaId, { sel: true }));
	};

export const offsetSelection =
	(offset: number) => (dispatch: AppDispatch, getState: GetState) => {
		const selectStart = selectStartSelection(getState());
		const newSelectionId = dispatch(selectAya(selectStart + offset));
		return newSelectionId !== undefined ? newSelectionId : selectStart;
	};

export const extendSelection =
	(ayaId: number) => (dispatch: AppDispatch, getState: GetState) => {
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

export const selectAya =
	(ayaId: number) => (dispatch: AppDispatch, getState: GetState) => {
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
