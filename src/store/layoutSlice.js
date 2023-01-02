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

export const DisplayMode = {};

const initialState = {
    viewAspect: 1,
    viewCapacity: ViewCapacity.onePage,
    zoomOptions: [],

    isNarrow: false, //hidden sidebar and stretched single page width
    isCompact: false, //single page with extra margin for popup
    isWide: false, //two pages with extra margin for popup
    isScrollable: false, // too wide
    pagesCount: 1,
    pagerWidth: 0,
    pageWidth: 0,
    pageMargin: 0,
    appWidth: 800,
    appHeight: 600,
    displayMode: 0, //(unused) 0:compact, 1:single page, 15:single page+margin, 2:two pages, 25: two pages+margin
    app_size: "two_pages",
    activePageIndex: -1,
    shownPages: [],
};

const calcShownPages = (slice) => {
    const pageIndex = slice.activePageIndex;
    if (pageIndex === -1) {
        slice.shownPages = [];
        return; //
    }
    if (slice.pagesCount === 1) {
        slice.shownPages = [pageIndex];
    } else {
        const firstPage = pageIndex - (pageIndex % 2);
        const secondePage = firstPage + 1;
        slice.shownPages = [firstPage, secondePage];
    }
};

const slice = createSlice({
    name: sliceName,
    initialState,
    reducers: {
        onResize: (slice, { payload: { width, height } }) => {
            const viewAspect = Math.floor((100 * width) / height) / 100;
            const zoomOptions = [];
            if (viewAspect < 0.7) {
                slice.viewCapacity = ViewCapacity.onePageCompact;
            } else if (viewAspect < 1.2) {
                slice.viewCapacity = ViewCapacity.onePage;
                if (viewAspect - 0.7 > 0.2) {
                    zoomOptions.push("fit_one_pages_width");
                }
            } else if (viewAspect < 1.35) {
                slice.viewCapacity = ViewCapacity.onePagePlus;
                zoomOptions.push("fit_one_page_width");
            } else if (viewAspect < 1.9) {
                zoomOptions.push("fit_one_page_width");
                if (viewAspect - 1.35 > 0.2) {
                    zoomOptions.push("fit_two_pages_width");
                }
                slice.viewCapacity = ViewCapacity.twoPages;
            } else {
                zoomOptions.push("fit_one_page_width");
                zoomOptions.push("fit_two_pages_width");
                slice.viewCapacity = ViewCapacity.twoPagesPlus;
            }
            slice.zoomOptions = zoomOptions;
            slice.viewAspect = viewAspect;
            slice.appWidth = width;
            slice.appHeight = height;

            const isNarrow = width / height < 0.7;
            const isScrollable = width / height > 2;
            const isWide = width / height > 1.8;
            const pageMargin = isNarrow ? 0 : 20;

            const pageAspectRatio = 10 / 16;
            const pagerHeight = height - 50;
            const pagerWidth = width - (isNarrow ? 0 : 50);

            slice.pagerWidth = pagerWidth;
            slice.pageMargin = pageMargin;

            if (isScrollable) {
                slice.pageWidth = pagerWidth - pageMargin * 2;
                slice.pageHeight = slice.pageWidth / pageAspectRatio;
            } else {
                slice.pageHeight = pagerHeight;
                const pageWidth = pagerHeight * pageAspectRatio;
                slice.pageWidth =
                    pageWidth < pagerWidth ? pageWidth : pagerWidth;
            }

            const pagesCount = isScrollable ? 1 : width > height * 1.35 ? 2 : 1;
            const isCompact =
                !isWide && pagesCount === 1 && width / height > 1.2;

            const app_size =
                pagesCount > 1
                    ? isWide
                        ? isScrollable
                            ? "two_page_scroll"
                            : "two_pages_plus"
                        : "two_pages"
                    : isScrollable
                    ? "one_page_scroll"
                    : isCompact
                    ? "one_page_plus"
                    : isNarrow
                    ? "one_page_minus"
                    : "one_page";

            slice.pagesCount = pagesCount;
            slice.isNarrow = isNarrow;
            slice.isWide = isScrollable ? false : isWide;
            slice.isCompact = isScrollable ? false : isCompact;
            slice.isScrollable = isScrollable;
            slice.app_size = app_size;
            calcShownPages(slice);
            // analytics.setParams({ app_size });
        },
        setActivePageIndex: (slice, action) => {
            slice.activePageIndex = action.payload;
            calcShownPages(slice);
        },
    },
});

export const selectZoomOptions = (state) => {
    return state[sliceName].zoomOptions;
};
export const selectPagesCount = (state) => state[sliceName].pagesCount;
export const selectAppSize = (state) => state[sliceName].app_size;
export const selectIsWide = (state) => state[sliceName].isWide;
export const selectIsNarrow = (state) => state[sliceName].isNarrow;
export const selectIsCompact = (state) => state[sliceName].isCompact;
export const selectIsScrollable = (state) => state[sliceName].isScrollable;
export const selectAppWidth = (state) => state[sliceName].appWidth;
export const selectAppHeight = (state) => state[sliceName].appHeight;
export const selectPageWidth = (state) => state[sliceName].pageWidth;

export const selectPageMargin = (state) => state[sliceName].pageMargin;
export const selectPageHeight = (state) => state[sliceName].pageHeight;
export const selectIsNarrowLayout = (state) => {
    const { isWide, isCompact, pagesCount } = state[sliceName];
    return !(isWide || isCompact || pagesCount > 1);
};

export const selectActiveSide = (state) =>
    state[sliceName].pagesCount === 1
        ? 0
        : state[sliceName].activePageIndex % 2;

export const selectPagerWidth = (state) => {
    const { pagerWidth, pageWidth, pageMargin, pagesCount, app_size } =
        state[sliceName];
    const popup = selectPopup(state);
    if (popup && ["two_pages_plus", "one_page_plus"].includes(app_size)) {
        return pageWidth * pagesCount + pageMargin * pagesCount * 2;
    }
    return pagerWidth;
};
// export const selectPagerWidth = (state) => {
//     const { popup } = state.ui;
//     const { isWide, appWidth, appHeight, isCompact, isNarrow, isScrollable } =
//         state[sliceName];

//     if (popup) {
//         if (isScrollable) {
//             return appWidth - appWidth / 3;
//         }
//         if (isWide) {
//             return appHeight * 1.25;
//         }
//         if (isCompact) {
//             return appHeight * 0.65;
//         }
//     }

//     return appWidth - (isNarrow ? 0 : 50);
// };

export const selectActivePage = (state) => state[sliceName].activePageIndex;
export const selectShownPages = (state) => state[sliceName].shownPages;

export const selectPopupWidth = (state) => {
    const {
        isWide,
        appWidth,
        appHeight,
        pagesCount,
        isCompact,
        isScrollable,
        isNarrow,
    } = state[sliceName];

    if (isScrollable) {
        return appWidth / 3;
    }

    if (isWide) {
        //popup fills up the margin of two pages view
        return appWidth - appHeight * 1.25 - 50;
    }
    if (isCompact) {
        //popup fills up the margin of one page view
        return appWidth - appHeight * 0.65 - 50;
    }

    //popup shown on top of pages
    return appWidth / pagesCount - (isNarrow ? 0 : 50);
};

export const { onResize, setActivePageIndex } = slice.actions;

//TODO: unused
export const updateAppSize =
    ({ width, height }) =>
    (dispatch) => {
        dispatch(onResize({ width, height }));
        // analytics.setParams({app_size});
    };

// eslint-disable-next-line import/no-anonymous-default-export
export default { [sliceName]: slice.reducer };
