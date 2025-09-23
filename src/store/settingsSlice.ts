import { createSlice } from "@reduxjs/toolkit";
import { ListReciters } from "@/services/audioData";
import { getStorageItem } from "@/services/utils";
import { AppDispatch, GetState, RootState } from "@/store/config";
import { TestMode } from "@/components/types";

const sliceName = "settings";

const initialState = {
	exerciseLevel: getStorageItem("exerciseLevel", 0),
	exerciseMemorized: getStorageItem("exerciseMemorized", false),
	randomAutoRecite: getStorageItem("randomAutoRecite", false),
	followPlayer: getStorageItem("followPlayer", false),
	repeat: getStorageItem("repeat", false),
	reciter:
		(getStorageItem("reciter", ListReciters()[0]) as ReciterID) || null,
	theme: getStorageItem("theme", "Dark"),
	lang: getStorageItem("lang", "ar"),
	testMode: getStorageItem("testMode", TestMode.reviewOnFinish) as TestMode,
};

const settingsSlice = createSlice({
	name: sliceName,
	initialState,
	reducers: {
		setExerciseLevel: (slice, { payload: level }) => {
			slice.exerciseLevel = level;
		},
		setExerciseMemorized: (slice, { payload: val }) => {
			slice.exerciseMemorized = val;
		},
		setRandomAutoRecite: (slice, { payload: val }) => {
			slice.randomAutoRecite = val;
		},
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
		setReciter: (slice, { payload: reciter }) => {
			slice.reciter = reciter;
		},
		setRepeat: (slice, { payload: repeat }) => {
			slice.repeat = repeat;
		},
		setFollowPlayer: (slice, { payload: followPlayer }) => {
			slice.followPlayer = followPlayer;
		},
		setTestMode: (slice, { payload: testMode }) => {
			slice.testMode = testMode;
		}
	},
});

export const {
	setLang,
	setTheme,
	setExerciseLevel,
	setExerciseMemorized,
	setRandomAutoRecite,
	setReciter,
	setRepeat,
	setFollowPlayer,
	setTestMode,
} = settingsSlice.actions;

export const saveTestMode = (testMode: TestMode) =>
	(dispatch: AppDispatch) => {
		dispatch(setTestMode(testMode));
		localStorage.setItem("testMode", testMode.toString());
	};
export const selectTestMode = (state: RootState) =>
	state[sliceName].testMode;
export const selectExerciseLevel = (state: RootState) =>
	state[sliceName].exerciseLevel;
export const selectExerciseMemorized = (state: RootState) =>
	state[sliceName].exerciseMemorized;
export const selectRandomAutoRecite = (state: RootState) =>
	state[sliceName].randomAutoRecite;

export const selectFollowPlayer = (state: RootState) =>
	state[sliceName].followPlayer;

export const selectLang = (state: RootState) => state[sliceName].lang;
export const selectTheme = (state: RootState) => state[sliceName].theme;

export const selectRepeat = (state: RootState) => state[sliceName].repeat;

export const selectReciter = (state: RootState) => state[sliceName].reciter;

export default { [sliceName]: settingsSlice.reducer };

export const changeReciter =
	(reciter: ReciterID) => (dispatch: AppDispatch, getState: GetState) => {
		const state = getState();
		const prevReciter = selectReciter(state);
		if (reciter === prevReciter) {
			return false;
		}
		dispatch(setReciter(reciter));
		localStorage.setItem("reciter", reciter);

		const updated_reciters = ListReciters("ayaAudio").filter(
			(r: string) => r !== reciter
		);

		updated_reciters.splice(0, 0, reciter);
		localStorage.setItem(
			"reciters_ayaAudio",
			JSON.stringify(updated_reciters)
		);

		return true;
	};

export const AudioRange = {
	continuous: 0,
	selection: 1,
	page: 2,
	sura: 3,
	part: 4,
	exercise: 5,
};

export type AudioRangeProp = (typeof AudioRange)[keyof typeof AudioRange];
