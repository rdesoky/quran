import { createSlice } from "@reduxjs/toolkit";
import {ListReciters} from "../services/AudioData";
import {AudioState} from "../context/Player";

const sliceName = "player";

const initialState = {
    visible: false,
    audioState: AudioState.stopped,
    playingAya: -1,
    rangeStart: -1,
    rangeEnd: -1,
    rangeType: 0,
};

const playerSlice = createSlice({
    name: sliceName,
    initialState,
    reducers: {
        setPlayingAya: (slice, {payload: playingAya}) => {
            slice.playingAya = playingAya;
        },
        setAudioState: (slice, {payload: audioState}) => {
            slice.audioState = audioState;
        }
    },
});

export default playerSlice;

export const { setAudioState, setPlayingAya } = playerSlice.actions;

