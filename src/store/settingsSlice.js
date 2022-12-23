import { createSlice } from "@reduxjs/toolkit";
import { ListReciters } from "../services/AudioData";

const sliceName = "settings";

const initialState = {
    exerciseLevel: JSON.parse(localStorage.getItem("exerciseLevel") || 0) || 0,
    exerciseMemorized: JSON.parse(
        localStorage.getItem("exerciseMemorized") || false
    ),
    randomAutoRecite: JSON.parse(
        localStorage.getItem("randomAutoRecite") || false
    ),
    followPlayer: JSON.parse(localStorage.getItem("followPlayer") || "true"),
    repeat: parseInt(localStorage.getItem("repeat") || "0"),
    reciter: localStorage.getItem("reciter") || ListReciters()[0],
    theme: localStorage.getItem("theme") || "Default",
    lang: localStorage.getItem("lang") || "ar",
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
} = settingsSlice.actions;

export const selectExerciseLevel = (state) => state[sliceName].exerciseLevel;
export const selectExerciseMemorized = (state) =>
    state[sliceName].exerciseMemorized;
export const selectRandomAutoRecite = (state) =>
    state[sliceName].randomAutoRecite;

export const selectFollowPlayer = (state) => state[sliceName].followPlayer;

export const selectLang = (state) => state[sliceName].lang;
export const selectTheme = (state) => state[sliceName].theme;

export const selectRepeat = (state) => state[sliceName].repeat;

export const selectReciter = (state) => state[sliceName].reciter;

// eslint-disable-next-line import/no-anonymous-default-export
export default { [sliceName]: settingsSlice.reducer };

export const changeReciter = (reciter) => (dispatch, getState) => {
    const state = getState();
    const prevReciter = selectReciter(state);
    if (reciter === prevReciter) {
        return false;
    }
    dispatch(setReciter(reciter));
    localStorage.setItem("reciter", reciter);

    let updated_reciters = ListReciters("ayaAudio").filter(
        (r) => r !== reciter
    );

    updated_reciters.splice(0, 0, reciter);
    localStorage.setItem("reciters_ayaAudio", JSON.stringify(updated_reciters));

    return true;
};

export const AudioRepeat = {
    noStop: 0,
    selection: 1,
    page: 2,
    sura: 3,
    part: 4,
    noRepeat: 5,
};
