import { createSlice } from "@reduxjs/toolkit";
import { GetAudioURL } from "../services/AudioData";

import { ayaIdInfo, TOTAL_VERSES } from "../services/QData";
import { selectSelectedRange } from "./navSlice";
import { selectReciter } from "./settingsSlice";

const sliceName = "audio";

export const AudioState = {
    stopped: "stopped",
    playing: "playing",
    paused: "paused",
    buffering: "buffering",
    error: "error",
};

const initialState = {
    audioState: AudioState.stopped,
    playingAya: -1,
    repeat: {
        start: 0,
        end: TOTAL_VERSES,
    },
    trackDuration: 0,
    remainingTime: 0,
};

const slice = createSlice({
    name: sliceName,
    initialState,
    reducers: {
        setPlayingAya: (slice, { payload: playingAya }) => {
            slice.playingAya = playingAya;
        },
        setAudioState: (slice, { payload: audioState }) => {
            slice.audioState = audioState;
            if (audioState === AudioState.stopped) {
                slice.remainingTime = 0;
            }
        },
        setTrackDuration: (slice, { payload: trackDuration }) => {
            slice.trackDuration = trackDuration;
            slice.remainingTime = trackDuration;
        },
        setRemainingTime: (slice, { payload: remainingTime }) => {
            slice.remainingTime = remainingTime;
        },
        setRepeatRange: (slice, { payload: { start, end } }) => {
            slice.repeat.start = start;
            slice.repeat.end = end;
        },
    },
});

// eslint-disable-next-line import/no-anonymous-default-export
export default { [sliceName]: slice.reducer };

export const {
    setAudioState,
    setPlayingAya,
    setTrackDuration,
    setRemainingTime,
    setRepeatRange,
} = slice.actions;

export const selectRepeatRange = (state) => state[sliceName].repeat;
export const selectPlayingAya = (state) => state[sliceName].playingAya;
export const selectAudioState = (state) => state[sliceName].audioState;
export const selectAudioSource = (ayaId) => (state) => {
    const reciter = selectReciter(state);
    let targetAya = ayaId;
    if (ayaId === undefined) {
        targetAya = selectPlayingAya(state);
    }
    if (targetAya === -1) {
        targetAya = selectSelectedRange(state).start;
    }
    if (targetAya === -1) {
        return null; //no audio source
    }
    const { sura, aya } = ayaIdInfo(targetAya);
    return GetAudioURL(reciter, sura + 1, aya + 1);
};

export const selectTrackDuration = (state) => state[sliceName].trackDuration;
export const selectRemainingTime = (state) => state[sliceName].remainingTime;
export const selectRepeatStart = (state) => state[sliceName].repeat.start;
export const selectRepeatEnd = (state) => state[sliceName].repeat.end;
