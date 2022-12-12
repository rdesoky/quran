import { createSlice } from "@reduxjs/toolkit";

const sliceName = "app";

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
    theme: localStorage.getItem("theme") || "Default",
    lang: localStorage.getItem("lang") || "ar",
    messageBox: false,
    contextPopup: false,
    user: null,
    toastMessage: null,
    expandedMenu: false,
    modalPopup: false,
    hifzRanges: [],
    bookmarks: [],
    daily: {
        pages: [], //{date:'??',pages:123}
        chars: [], //{date:'??',chars:123}
    },
    isNarrow: false, //hidden sidebar and stretched single page width
    isCompact: false, //single page with extra margin for popup
    isWide: false, //two pages with extra margin for popup
    isScrollable: false, // too wide
    pagesCount: 1,
    appWidth: 800,
    appHeight: 600,
    displayMode: 0, //0:compact, 1:single page, 15:single page+margin, 2:two pages, 25: two pages+margin
    app_size: "two_pages",
    showMenu: false,
    popup: null,
    popupParams: {},
    showPopup: false,
    selectStart: 0,
    selectEnd: 0,
    maskStart: -1,
    recentCommands: initSidebarCommands,
};

const appSlice = createSlice({
    name: sliceName,
    initialState,
    reducers: {
        setTheme: (slice, { payload: theme }) => {
            slice.theme = theme;
        },
        setLang: (slice, { payload: lang }) => {
            slice.lang = lang;
            localStorage.setItem("lang", lang);
        },
        toggleTheme: (slice) => {
            slice.theme = slice.theme === "Default" ? "Dark" : "Default";
        },

        setUser: (slice, action) => {
            slice.user = action.payload;
        },
        onResize: (slice, { payload: { width, height } }) => {
            slice.appWidth = width;
            slice.appHeight = height;
            const pagesCount = width > height * 1.35 ? 2 : 1;

            const isNarrow = width / height < 0.7;
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
            // analytics.setParams({ app_size });
        },
    },
});

export default appSlice;

export const selectUser = (state) => state[sliceName].user;
export const selectPagesCount = (state) => state[sliceName].pagesCount;
export const selectAppSize = (state) => state[sliceName].app_size;
export const selectLang = (state) => state[sliceName].lang;
export const selectTheme = (state) => state[sliceName].theme;

export const { setTheme, setLang, toggleTheme, setUser, onResize } =
    appSlice.actions;
