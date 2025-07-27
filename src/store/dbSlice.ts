import { createSlice } from "@reduxjs/toolkit";
import firebase from "firebase";
import { quranNormalizedText } from "@/data/quran";
import { dateKey, num2string } from "@/services/utils";
import { AppDispatch, GetState, RootState } from "@/store/config";
import { showToast } from "@/store/uiSlice";

const sliceName = "db";

const initialState = {
	user: null as firebase.User | null,
	hifzRanges: [] as HifzRange[],
	bookmarks: [] as Bookmark[],
	daily: {
		pages: [] as DailyActivity[],
		chars: [] as DailyActivity[],
	},
};

const slice = createSlice({
	name: sliceName,
	initialState,
	reducers: {
		setUser: (slice, action) => {
			slice.user = action.payload;
		},
		setBookmarks: (
			slice,
			{ payload: { bookmarks } }: { payload: { bookmarks: Bookmark[] } }
		) => {
			slice.bookmarks = bookmarks;
		},
		setHifzRanges: (
			slice,
			{
				payload: { hifzRanges },
			}: { payload: { hifzRanges: HifzRange[] } }
		) => {
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
export const { setUser, setActivities, setBookmarks, setHifzRanges } =
	slice.actions;

// eslint-disable-next-line import/no-anonymous-default-export
export default { [sliceName]: slice.reducer };

//Selectors
export const selectUser = (state: RootState) => state[sliceName].user;
export const selectPhotoUrl = (state: RootState) =>
	state[sliceName].user?.photoURL;
export const selectBookmarks = (state: RootState) => state[sliceName].bookmarks;
export const selectIsBookmarked = (ayaId: number) => (state: RootState) => {
	const { bookmarks } = state[sliceName];
	const bookMarkInfo = bookmarks?.find(
		(bookmarkInfo) => Number(bookmarkInfo.aya) === ayaId
	);
	return bookMarkInfo === undefined ? false : true;
};
export const selectHifzRanges = (state: RootState) =>
	state[sliceName].hifzRanges;
export const selectDailyActivities = (state: RootState) =>
	state[sliceName].daily;

//caching sura ranges
const suraRanges: Record<number, HifzRange[]> = {};

export const selectSuraRanges = (sura: number) => (state: RootState) => {
	const ranges = state[sliceName].hifzRanges
		.filter((r) => r.sura === sura)
		.sort((r1, r2) => (r1.startPage > r2.startPage ? 1 : -1));
	if (suraRanges[sura]) {
		suraRanges[sura].splice(0, suraRanges[sura].length, ...ranges);
	} else {
		suraRanges[sura] = ranges;
	}
	return suraRanges[sura];
};

//Thunks

export const addBookmark =
	(ayaId: number) => (dispatch: AppDispatch, getState: GetState) => {
		const { user } = getState()[sliceName];
		if (!user) {
			return;
		}
		bookmarksRef(user).child(String(ayaId)).set(-new Date().getTime());
		dispatch(showToast({ id: "bookmark_added" }));
	};

export const deleteBookmark =
	(ayaId: number) => (dispatch: AppDispatch, getState: GetState) => {
		const { user } = getState()[sliceName];
		if (!user) {
			return;
		}
		bookmarksRef(user).child(String(ayaId)).set(null);
		dispatch(showToast({ id: "bookmark_deleted" }));
	};

export const logTypedVerse =
	(verseId: number, words: number = 0) =>
		(dispatch: AppDispatch, getState: GetState) => {
			const state = getState();
			const { user } = state[sliceName];
			if (!user) {
				return 0;
			}
			const verseText = quranNormalizedText[verseId];
			const today = new Date();
			const activityKey = dateKey(today);
			const activityCharsRef = activityRef(user).child(
				activityKey + "/chars"
			);
			const charsCount = words
				? verseText.split(" ").slice(0, words).join("").length
				: verseText.replace(/\s/g, "").length;
			activityCharsRef.once("value", (snapshot) => {
				let chars = snapshot.val() || 0;
				chars += charsCount;
				activityCharsRef.set(chars);
			});

			return charsCount;
		};

export const setRangeRevised =
	(range: { id: string; pages: number }) =>
		(dispatch: AppDispatch, getState: GetState) => {
			const state = getState();
			const { user } = state[sliceName];
			if (!user) {
				return;
			}
			const rangeNodeRef = hifzRef(user).child(range.id);
			rangeNodeRef.once("value", (snapshot) => {
				let curr_range = snapshot.val();
				const now = Date.now();
				const timeSinceLastRevision = now - curr_range.ts;
				if (timeSinceLastRevision > 60 * 60 * 1000) {
					//One hour has passed since last revision
					curr_range.ts = now;
					curr_range.revs++;
					//Record new activity
					const today = new Date();
					const activityKey = dateKey(today);
					const activityPagesRef = activityRef(user).child(
						activityKey + "/pages"
					);
					activityPagesRef.once("value", (snapshot) => {
						let pages = snapshot.val() || 0;
						pages += range.pages;
						activityPagesRef.set(pages);
					});
				}
				rangeNodeRef.set(curr_range);
			});
		};

const includesRanges = (
	hifzRanges: HifzRange[],
	sura: number,
	startPage: number,
	pages: number
) => {
	const endPage = startPage + pages;
	const foundRanges = hifzRanges.filter(
		(r) =>
			r.sura === sura &&
			(r.startPage + 1).between(startPage, endPage) &&
			r.endPage.between(startPage, endPage)
	);
	return foundRanges.length;
};

export const addHifzRange =
	(startPage: number, sura: number, pages: number, overwrite = false) =>
		(dispatch: AppDispatch, getState: GetState) => {
			const { user, hifzRanges } = getState()[sliceName];
			if (!user) {
				return false;
			}

			//TODO: implement the merging logic in a Firebase function

			if (!overwrite && includesRanges(hifzRanges, sura, startPage, pages)) {
				return false;
			}

			const fourteenDaysAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
			const newRangeID = num2string(startPage, 3) + num2string(sura);
			let newRange: NewRange = {
				revs: 0,
				startPage,
				endPage: startPage + pages - 1,
				pages: pages,
			};
			let addNew = true;

			//Calculate average rev/page
			const mergeRangesRevs = (r1: NewRange, r2: NewRange) => {
				const totalRevs = r1.revs * r1.pages + r2.revs * r2.pages;
				const startPage = Math.min(r1.startPage, r2.startPage);
				const endPage = Math.max(r1.endPage, r2.endPage);
				const newTotalPages = endPage - startPage + 1;
				return Math.floor(totalRevs / newTotalPages);
			};

			//check if merging with intersecting ranges is required
			const suraRanges = hifzRanges
				.filter((r) => r.sura === sura)
				.sort((r1, r2) => (r1.startPage > r2.startPage ? -1 : 1)); //reverse

			//check tailed ranges first
			suraRanges.forEach((r) => {
				if (
					newRange.startPage === r.startPage &&
					newRange.pages === r.pages
				) {
					//found exact range, skip it
					addNew = false;
					return;
				}

				if (
					newRange.startPage <= r.startPage &&
					newRange.endPage + 1 >= r.startPage
				) {
					//intersecting with tailed range,
					//append its pages (beyond our last page) and revs, and delete it
					newRange.endPage = Math.max(newRange.endPage, r.endPage);
					//Calculate partial revs
					newRange.revs = mergeRangesRevs(newRange, r);
					newRange.pages = newRange.endPage - newRange.startPage + 1;
					//delete merged range
					hifzRef(user).child(r.id).set(null);
				}

				if (
					newRange.startPage > r.startPage &&
					newRange.startPage <= r.endPage + 1
				) {
					//intersecting with prior range, add additional pages to it, don't add new one
					if (newRange.endPage > r.endPage) {
						//Not completely inside an old range
						let oldRange = Object.assign({}, r);
						oldRange.revs = mergeRangesRevs(oldRange, newRange);
						oldRange.endPage = newRange.endPage;
						oldRange.pages = oldRange.endPage - oldRange.startPage + 1;

						//Update old range
						hifzRef(user).child(oldRange.id).set({
							pages: oldRange.pages,
							ts: fourteenDaysAgo,
							revs: oldRange.revs,
						});

						newRange = oldRange;
					}
					addNew = false;
				}
			});

			if (addNew) {
				hifzRef(user).child(newRangeID).set({
					pages: newRange.pages,
					ts: fourteenDaysAgo,
					revs: newRange.revs,
				});
			}
			return true;
		};

export const deleteHifzRange =
	(range: HifzRange) => (dispatch: AppDispatch, getState: GetState) => {
		const { user } = getState()[sliceName];
		if (!user) {
			return;
		}
		hifzRef(user).child(range.id).set(null);
	};

export const signOut = () => (dispatch: AppDispatch, getState: GetState) => {
	// dispatch(setBookmarks([]));
	// dispatch(setHifzRanges([]));
	// dispatch(setUser(null));
	// dispatch(setActivities({ daily: {} }));
	return firebase.auth().signOut();
};

//utilities
export const dbRef = () => {
	return firebase.app().database().ref();
};
export const userRef = (user: firebase.User) => {
	return dbRef().child(`data/${user?.uid}`);
};
export const activityRef = (user: firebase.User) => {
	return userRef(user).child(`activity`);
};
export const hifzRef = (user: firebase.User) => {
	return userRef(user).child(`hifz`);
};
export const bookmarksRef = (user: firebase.User) => {
	return userRef(user).child(`aya_marks`);
};
