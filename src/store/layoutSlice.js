import { createSlice } from "@reduxjs/toolkit";

export const sliceName = "layout";

const initialState = {
    isNarrow: false, //hidden sidebar and stretched single page width
    isCompact: false, //single page with extra margin for popup
    isWide: false, //two pages with extra margin for popup
    isScrollable: false, // too wide
    pagesCount: 1,
    pageWidth: 0,
    pageMargin: "0",
    appWidth: 800,
    appHeight: 600,
    displayMode: 0, //0:compact, 1:single page, 15:single page+margin, 2:two pages, 25: two pages+margin
    app_size: "two_pages",
    showMenu: false,
    selectStart: 0,
    selectEnd: 0,
    maskStart: -1,
    modalPopup: false, //used to block user interaction outside the active popup
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
            slice.appWidth = width;
            slice.appHeight = height;
            slice.pageHeight = height - 50;

            let pageWidth = slice.pageHeight * 0.61; //aspect ratio
            if (pageWidth > width) {
                pageWidth = slice.appWidth;
            }
            slice.pageWidth = pageWidth;

            const pagesCount = width > height * 1.35 ? 2 : 1;

            const isNarrow = width / height < 0.7;
            slice.pageMargin = isNarrow ? "0" : "0 20px";
            const isWide = width / height > 1.8;
            const isCompact =
                !isWide && pagesCount === 1 && width / height > 1.2;
            const isScrollable = width / height > 2.7;

            const app_size =
                pagesCount > 1
                    ? isWide
                        ? isScrollable
                            ? "extra_wide"
                            : "wide_two_pages"
                        : "two_pages"
                    : isCompact
                    ? "wide_one_page"
                    : isNarrow
                    ? "narrow_one_page"
                    : "one_page";

            slice.pagesCount = pagesCount;
            slice.isNarrow = isNarrow;
            slice.isWide = isWide;
            slice.isCompact = isCompact;
            slice.isScrollable = isScrollable;
            slice.app_size = app_size;
            calcShownPages(slice);
            // analytics.setParams({ app_size });
        },
        setModalPopup: (slice, action) => {
            slice.modalPopup = action.payload;
        },
        setActivePageIndex: (slice, action) => {
            slice.activePageIndex = action.payload;
            calcShownPages(slice);
        },
    },
});

export const selectModalPopup = (state) => state[sliceName].modalPopup;
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

export const selectActiveSide = (state) =>
    state[sliceName].pagesCount === 1
        ? 0
        : state[sliceName].activePageIndex % 2;

export const selectPagerWidth = (state) => {
    const { popup } = state.ui;
    const { isWide, appWidth, appHeight, isCompact, isNarrow, isScrollable } =
        state[sliceName];

    if (popup) {
        if (isScrollable) {
            return appWidth - appWidth / 3;
        }
        if (isWide) {
            return appHeight * 1.25;
        }
        if (isCompact) {
            return appHeight * 0.65;
        }
    }

    return appWidth - (isNarrow ? 0 : 50);
};

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

export const { onResize, setModalPopup, setActivePageIndex } = slice.actions;

export const updateAppSize =
    ({ width, height }) =>
    (dispatch) => {
        dispatch(onResize({ width, height }));
        // analytics.setParams({app_size});
    };

// eslint-disable-next-line import/no-anonymous-default-export
export default { [sliceName]: slice.reducer };
