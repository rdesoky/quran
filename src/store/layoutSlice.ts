import { createSlice } from "@reduxjs/toolkit";
import { AppDispatch, GetState, RootState } from "@/store/config";
import { selectPopup } from "@/store/uiSlice";

export const sliceName = "layout";

export const ViewCapacity = {
	onePageCompact: "one_full_page_compact",
	onePage: "one_full_page", //exactly fitting one page
	onePagePlus: "one_full_page_plus", //can accommodate popup
	twoPages: "two_full_pages", //exactly fitting two pages
	twoPagesPlus: "two_full_pages_plus", //can accommodate popup
};

export const PAGE_ASPECT = 11 / 16;
export const SIDE_BAR_WIDTH = 50;
export const PAGE_HEADER_HEIGHT = 25; //height of the header area, used to calculate pager height
export const PAGE_FOOTER_HEIGHT = 25;

export const DisplayMode = {};

const initialZoom = Number(localStorage.getItem("zoom"));

const initialState = {
	viewCapacity: ViewCapacity.onePage,
	zoom: isNaN(initialZoom) ? 0 : initialZoom, //0: no zoom, 1: fit one page, 2: fit two page
	zoomLevels: 0,
	appWidth: 800,
	appHeight: 600,
	displayMode: 0, //(unused) 0:compact, 1:single page, 15:single page+margin, 2:two pages, 25: two pages+margin
	activePageIndex: -1,
	viewAspect: 0, //aspect ratio of the view
	viewAspect2: 0, //aspect ratio of the view without side bar
	pagerHeight: 600 - PAGE_FOOTER_HEIGHT, //height of the pager area
	isCompact: false, //is the layout compact (one page compact)
};

const slice = createSlice({
	name: sliceName,
	initialState,
	reducers: {
		onResize: (slice, { payload: { width, height } }) => {
			let zoomLevels = 0;
			const viewWidth = width - SIDE_BAR_WIDTH;
			const viewHeight = height - PAGE_FOOTER_HEIGHT;
			const viewAspect = viewWidth / viewHeight;
			const viewAspect2 = (viewWidth - 300) / viewHeight;
			slice.viewAspect = viewAspect;
			slice.viewAspect2 = viewAspect2;
			if (viewAspect2 > PAGE_ASPECT * 2.2) {
				slice.viewCapacity = ViewCapacity.twoPagesPlus;
				zoomLevels = 2;
			} else if (viewAspect >= PAGE_ASPECT * 2) {
				slice.viewCapacity = ViewCapacity.twoPages;
				zoomLevels = 2;
			// } else if (viewAspect >= PAGE_ASPECT * 2) {
			// 	slice.viewCapacity = ViewCapacity.twoPages;
			// 	zoomLevels = 1;
			} else if (viewAspect2 > PAGE_ASPECT) {
				slice.viewCapacity = ViewCapacity.onePagePlus;
				zoomLevels = 1;
			} else if (viewAspect > PAGE_ASPECT * 1.2) {
				slice.viewCapacity = ViewCapacity.onePage;
				zoomLevels = 1;
			} else if (viewAspect >= PAGE_ASPECT) {
				slice.viewCapacity = ViewCapacity.onePage;
			} else {
				slice.viewCapacity = ViewCapacity.onePageCompact;
			}
			slice.zoomLevels = zoomLevels;
			// slice.viewAspect = Math.floor((100 * width) / height) / 100;
			slice.appWidth = width;
			slice.appHeight = height;
			slice.pagerHeight = height - PAGE_FOOTER_HEIGHT;
		},
		setActivePageIndex: (slice, action) => {
			slice.activePageIndex = action.payload;
		},
		setZoom: (slice, action) => {
			slice.zoom = action.payload;
		},
	},
});

export const selectZoomLevels = (state: RootState) => {
	return state[sliceName].zoomLevels;
};
export const selectZoom = (state: RootState) => {
	const zoomLevels = selectZoomLevels(state);
	const zoom = state[sliceName].zoom;
	return zoom <= zoomLevels ? zoom : zoomLevels;
};
export const selectZoomClass = (state: RootState) => {
	const zoom = selectZoom(state);
	return ["", "fit_page", "fit_two_pages"][zoom];
};
export const selectPagesCount = (state: RootState) => {
	const viewWidth = selectViewWidth(state);
	const pageWidth = selectPageWidth(state);
	return Math.floor(viewWidth / pageWidth) >= 2 ? 2 : 1;
};
export const selectViewCapacity = (state: RootState) =>
	state[sliceName].viewCapacity;
export const selectIsNarrow = (state: RootState) => {
	const viewCapacity = selectViewCapacity(state);
	return viewCapacity === ViewCapacity.onePageCompact;
};
export const selectIsCompact = (state: RootState) => state[sliceName].isCompact;
export const selectAppWidth = (state: RootState) => state[sliceName].appWidth;
export const selectAppHeight = (state: RootState) => state[sliceName].appHeight;

export const selectPageMargin = (state: RootState) => {
	const { viewCapacity } = state[sliceName];
	return viewCapacity === ViewCapacity.onePageCompact ? 0 : 20;
};
//detect if popup will cover the only shown page
// export const selectIsNarrowLayout = (state:RootState) => {
//     const zoom = selectZoom(state);
//     const viewCapacity = selectViewCapacity(state);
//     return (
//         [ViewCapacity.onePageCompact, ViewCapacity.onePage].includes(
//             viewCapacity
//         ) || zoom === 1
//     );
// };

export const selectActiveSide = (state: RootState) => {
	const pagesCount = selectPagesCount(state);
	const activePageIndex = selectActivePage(state);
	return pagesCount === 1 ? 0 : activePageIndex % 2;
};
export const selectPagerHeight = (state: RootState) =>
	state[sliceName].appHeight - PAGE_FOOTER_HEIGHT - PAGE_HEADER_HEIGHT;

export const selectPagerWidth = (state: RootState) => {
	const viewWidth = selectViewWidth(state);
	const viewCapacity = selectViewCapacity(state);
	const zoom = selectZoom(state);
	if (zoom === 0) {
		if (
			[ViewCapacity.onePagePlus, ViewCapacity.twoPagesPlus].includes(
				viewCapacity
			)
		) {
			if (selectPopup(state)) {
				const popupWidth = selectPopupWidth(state);
				return viewWidth - popupWidth;
			}
		}
	}
	return viewWidth;
};
export const selectPageWidth = (state: RootState) => {
	const pagerHeight = selectPagerHeight(state);
	const zoom = selectZoom(state);
	const pagerWidth = selectPagerWidth(state);
	let width;
	switch (zoom) {
		case 1:
			width = pagerWidth;
			break;
		case 2:
			width = pagerWidth / 2;
			break;
		default:
			width = pagerHeight * PAGE_ASPECT;
	}
	if (width > pagerWidth) {
		return pagerWidth;
	}
	return width;
};

export const selectPageHeight = (state: RootState) => {
	const pagerHeight = selectPagerHeight(state);
	const height = selectPageWidth(state) / PAGE_ASPECT;
	if (height < pagerHeight) {
		return pagerHeight;
	}
	return height;
};

export const selectActivePage = (state: RootState) =>
	state[sliceName].activePageIndex;

const shownPages: number[] = []; //to avoid creating new array on each selector call

export const selectShownPages = (state: RootState) => {
	const pageIndex = selectActivePage(state);
	const pagesCount = selectPagesCount(state);
	if (pageIndex === -1) {
		shownPages.length = 0;
	} else if (pagesCount === 1) {
		shownPages.length = 1;
		shownPages[0] = pageIndex;
	} else {
		const firstPage = pageIndex - (pageIndex % 2);
		const secondePage = firstPage + 1;
		shownPages[0] = firstPage;
		shownPages[1] = secondePage;
	}
	return shownPages;
};
export const selectViewWidth = (state: RootState) => {
	const { appWidth, viewCapacity } = state[sliceName];
	if (viewCapacity === ViewCapacity.onePageCompact) {
		return appWidth;
	}
	return appWidth - SIDE_BAR_WIDTH;
};

export const selectPopupLeft = (state: RootState) => {
	const zoom = selectZoom(state);
	const activeSide = selectActiveSide(state);
	const popupWidth = selectPopupWidth(state);
	if (zoom !== 0) {
		//fit one or two pages width
		return activeSide * popupWidth;
	}
	//fit one or two pages hight
	const viewCapacity = selectViewCapacity(state);
	switch (viewCapacity) {
		case ViewCapacity.onePagePlus:
		case ViewCapacity.twoPagesPlus:
			return 0;
		default:
			return activeSide * popupWidth;
	}
};
export const selectPopupWidth = (state: RootState) => {
	const viewWidth = selectViewWidth(state);
	const pagerHeight = selectPagerHeight(state);
	const zoom = selectZoom(state);
	if (zoom === 0) {
		const pageWidth = pagerHeight * PAGE_ASPECT;
		const viewCapacity = selectViewCapacity(state);
		switch (viewCapacity) {
			case ViewCapacity.onePagePlus:
				return viewWidth - pageWidth;
			case ViewCapacity.twoPagesPlus:
				return viewWidth - 2 * pageWidth;
			case ViewCapacity.twoPages:
				return viewWidth / 2;
			case ViewCapacity.onePageCompact:
			case ViewCapacity.onePage:
			default:
				return viewWidth;
		}
	}
	return viewWidth / zoom; //full or half the view width
};

export const { onResize, setActivePageIndex, setZoom } = slice.actions;

export const toggleZoom = () => (dispatch: AppDispatch, getState: GetState) => {
	const state = getState();
	const zoomLevels = selectZoomLevels(state);
	let zoom = selectZoom(state);
	if (zoom > 0) {
		zoom--;//zoom in
	} else {
		zoom = zoomLevels;//zoom out
	}
	localStorage.zoom = zoom;
	dispatch(setZoom(zoom));
};

export default { [sliceName]: slice.reducer };
