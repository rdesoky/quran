import { createSlice } from "@reduxjs/toolkit";

const sliceName = "settings";

const initialState = {
    exerciseLevel: JSON.parse(localStorage.getItem("exerciseLevel") || 0) || 0,
    exerciseMemorized: JSON.parse(
        localStorage.getItem("exerciseMemorized") || false
    ),
    randomAutoRecite: JSON.parse(
        localStorage.getItem("randomAutoRecite") || false
    ),
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
    },
});

export default settingsSlice;

export const { setExerciseLevel, setExerciseMemorized, setRandomAutoRecite } =
    settingsSlice.actions;

export const selectExerciseLevel = (state) => state[sliceName].exerciseLevel;
export const selectExerciseMemorized = (state) =>
    state[sliceName].exerciseMemorized;
export const selectRandomAutoRecite = (state) =>
    state[sliceName].randomAutoRecite;
