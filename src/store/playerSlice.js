import { createSlice } from "@reduxjs/toolkit";
import { GetAudioURL, ListReciters } from "../services/AudioData";

import {
  ayaID,
  ayaIdInfo,
  ayaIdPage,
  getPageFirstAyaId,
  getPartFirstAyaId,
  getPartIndexByAyaId,
  TOTAL_VERSES,
} from "../services/QData";
import { changeReciter, selectRepeat } from "./settingsSlice";
import { selectRange, selectStart } from "./navSlice";

const sliceName = "player";

export const AudioState = {
  stopped: 0,
  playing: 1,
  paused: 2,
  buffering: 3,
  error: 4,
};

export const AudioRepeat = {
  noRepeat: 0,
  noStop: 0,
  selection: 1,
  page: 2,
  sura: 3,
  part: 4,
  verse: 5,
};

const initialState = {
  visible: false,
  audioState: AudioState.stopped,
  playingAya: -1,
  rangeStart: -1,
  rangeEnd: -1,
  rangeType: 0,
  trackDuration: 0,
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
    },
    setTrackDuration: (slice, { payload: trackDuration }) => {
      slice.trackDuration = trackDuration;
    },
  },
});

export default { [sliceName]: slice.reducer };

export const { setAudioState, setPlayingAya } = slice.actions;

export const selectPlayingAya = (state) => state[sliceName].playingAya;
export const selectAudioState = (state) => state[sliceName].audioState;
export const selectAudioSource = (ayaId) => (state) => {
  const { playingAya, reciter } = state[sliceName];
  if (playingAya === -1) {
    return null; //no audio source
  }
  const { sura, aya } = ayaIdInfo(ayaId !== undefined ? ayaId : playingAya);
  return GetAudioURL(reciter, sura + 1, aya + 1);
};

export const selectTrackDuration = (state) => state[sliceName].trackDuration;

//thunks
export const play = (player, ayaId) => (dispatch, getState) => {
  const state = getState();
  const audioState = selectAudioState(state);
  const playingAya = selectPlayingAya(state);
  const targetAya = ayaId !== undefined ? ayaId : selectStart(state);
  if (audioState === AudioState.playing && playingAya === targetAya) {
    return;
  }
  player.play(targetAya);
};

export const stop = (player) => (dispatch) => {
  // dispatch(setAudioState(AudioState.stopped));
  dispatch(setPlayingAya(-1));
  player.stop();
};

export const playerChangeReciter = (reciter) => (dispatch, getState) => {
  if (!dispatch(changeReciter(reciter))) {
    return; //same reciter
  }
  const audioState = selectAudioState(getState());
  switch (audioState) {
    case AudioState.paused:
      dispatch(stop());
      break;
    case AudioState.playing:
      dispatch(play()); //TODO: check if timeout is required
      break;
    default:
      break;
  }
};
