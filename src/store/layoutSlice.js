import { createSlice } from "@reduxjs/toolkit";
import { selectPopup } from "./uiSlice";

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
export const PAGE_FOOTER_HEIGHT = 50;

export const DisplayMode = {};

const initialZoom = parseInt(localStorage.getItem("zoom"));

const initialState = {
    viewCapacity: ViewCapacity.onePage,
    zoom: isNaN(initialZoom) ? 0 : initialZoom, //0: no zoom, 1: fit one page, 2: fit two page
    zoomLevels: 0,
    appWidth: 800,
    appHeight: 600,
    displayMode: 0, //(unused) 0:compact, 1:single page, 15:single page+margin, 2:two pages, 25: two pages+margin
    activePageIndex: -1,
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
            } else if (viewAspect >= PAGE_ASPECT * 2) {
                slice.viewCapacity = ViewCapacity.twoPages;
                zoomLevels = 1;
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

export const selectZoomLevels = (state) => {
    return state[sliceName].zoomLevels;
};
export const selectZoom = (state) => {
    const zoomLevels = selectZoomLevels(state);
    let zoom = state[sliceName].zoom;
    return zoom <= zoomLevels ? zoom : zoomLevels;
};
export const selectZoomClass = (state) => {
    const zoom = selectZoom(state);
    return ["", "fit_page", "fit_two_pages"][zoom];
};
export const selectPagesCount = (state) => {
    const viewWidth = selectViewWidth(state);
    const pageWidth = selectPageWidth(state);
    return Math.floor(viewWidth / pageWidth) >= 2 ? 2 : 1;
};
export const selectViewCapacity = (state) => state[sliceName].viewCapacity;
export const selectIsNarrow = (state) => {
    const viewCapacity = selectViewCapacity(state);
    return viewCapacity === ViewCapacity.onePageCompact;
};
export const selectIsCompact = (state) => state[sliceName].isCompact;
export const selectAppWidth = (state) => state[sliceName].appWidth;
export const selectAppHeight = (state) => state[sliceName].appHeight;

export const selectPageMargin = (state) => {
    const { viewCapacity } = state[sliceName];
    return viewCapacity === ViewCapacity.onePageCompact ? 0 : 20;
};
//detect if popup will cover the only shown page
// export const selectIsNarrowLayout = (state) => {
//     const zoom = selectZoom(state);
//     const viewCapacity = selectViewCapacity(state);
//     return (
//         [ViewCapacity.onePageCompact, ViewCapacity.onePage].includes(
//             viewCapacity
//         ) || zoom === 1
//     );
// };

export const selectActiveSide = (state) => {
    const pagesCount = selectPagesCount(state);
    const activePageIndex = selectActivePage(state);
    return pagesCount === 1 ? 0 : activePageIndex % 2;
};
export const selectPagerHeight = (state) =>
    state[sliceName].appHeight - PAGE_FOOTER_HEIGHT;

export const selectPagerWidth = (state) => {
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
export const selectPageWidth = (state) => {
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

export const selectPageHeight = (state) => {
    const pagerHeight = selectPagerHeight(state);
    const height = selectPageWidth(state) / PAGE_ASPECT;
    if (height < pagerHeight) {
        return pagerHeight;
    }
    return height;
};

export const selectActivePage = (state) => state[sliceName].activePageIndex;

export const selectShownPages = (state) => {
    const pageIndex = selectActivePage(state);
    const pagesCount = selectPagesCount(state);
    if (pageIndex === -1) {
        return [];
    }
    if (pagesCount === 1) {
        return [pageIndex];
    } else {
        const firstPage = pageIndex - (pageIndex % 2);
        const secondePage = firstPage + 1;
        return [firstPage, secondePage];
    }
};
export const selectViewWidth = (state) => {
    const { appWidth, viewCapacity } = state[sliceName];
    if (viewCapacity === ViewCapacity.onePageCompact) {
        return appWidth;
    }
    return appWidth - SIDE_BAR_WIDTH;
};

export const selectPopupLeft = (state) => {
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
export const selectPopupWidth = (state) => {
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

export const toggleZoom = () => (dispatch, getState) => {
    const state = getState();
    const zoomLevels = selectZoomLevels(state);
    let zoom = selectZoom(state);
    if (zoom > 0) {
        zoom--;
    } else {
        zoom = zoomLevels;
    }
    localStorage.zoom = zoom;
    dispatch(setZoom(zoom));
};

// eslint-disable-next-line import/no-anonymous-default-export
export default { [sliceName]: slice.reducer };
