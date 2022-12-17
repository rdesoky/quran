import { createSlice } from "@reduxjs/toolkit";

const sliceName = "user";

const initialState = {
    user: null,
    hifzRanges: [],
    bookmarks: [],
    daily: {
        pages: [], //{date:'??',pages:123}
        chars: [], //{date:'??',chars:123}
    },
};

const userSlice = createSlice({
    name: sliceName,
    initialState,
    reducers: {
        setUserId: (slice, action) => {
            slice.user = action.payload;
        },
        setBookmarks: (slice, { payload: { bookmarks } }) => {
            slice.bookmarks = bookmarks;
        },
        setHifzRanges: (slice, { payload: { hifzRanges } }) => {
            slice.hifzRanges = hifzRanges;
        },
        setActivities: (
            slice,
            {
                payload: {
                    daily: { chars, pages },
                },
            }
        ) => {
            slice.daily.chars = chars;
            slice.daily.pages = pages;
        },
    },
});
export const { setUserId, setActivities, setBookmarks, setHifzRanges } =
    userSlice.actions;

export default { [sliceName]: userSlice.reducer };