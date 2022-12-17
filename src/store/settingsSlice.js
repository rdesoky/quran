import { createSlice } from "@reduxjs/toolkit";
import {ListReciters} from "../services/AudioData";

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
        },    },
});


export const { setLang, setTheme, setExerciseLevel, setExerciseMemorized, setRandomAutoRecite } =
    settingsSlice.actions;

export const selectExerciseLevel = (state) => state[sliceName].exerciseLevel;
export const selectExerciseMemorized = (state) =>
    state[sliceName].exerciseMemorized;
export const selectRandomAutoRecite = (state) =>
    state[sliceName].randomAutoRecite;

export const selectLang = (state) => state[sliceName].lang;
export const selectTheme = (state) => state[sliceName].theme;

export default {[sliceName]: settingsSlice.reducer };