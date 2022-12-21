import { createContext, useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector, useStore } from "react-redux";
import {
    AudioState,
    selectAudioSource,
    selectAudioState,
    selectPlayingAya,
    setAudioState,
    setPlayingAya,
} from "../store/playerSlice";
import { selectFollowPlayer, selectRepeat } from "../store/settingsSlice";
import { AudioRepeat } from "../context/Player";
import {
    ayaID,
    ayaIdInfo,
    ayaIdPage,
    getPageFirstAyaId,
    getPartFirstAyaId,
    getPartIndexByAyaId,
    TOTAL_VERSES,
} from "../services/QData";
import { selectRange } from "../store/navSlice";

export const AudioContext = createContext({});

export function Audio({ children }) {
    const audioRef = useRef();
    const dispatch = useDispatch();
    const audioState = useSelector(selectAudioState);
    const playingAya = useSelector(selectPlayingAya);
    // const audioSource = useSelector(selectAudioSource(playingAya));
    const followPlayer = useSelector(selectFollowPlayer);
    const repeat = useSelector(selectRepeat);
    const store = useStore();
    const selectedRange = useSelector(selectRange);

    let player = audioRef.current;

    const offsetPlayingAya = (offset) => {
        let nextAya = playingAya;

        switch (repeat) {
            case AudioRepeat.verse: //single aya
                return -1;
            case AudioRepeat.selection: //selection
                nextAya += offset;
                if (
                    nextAya > selectedRange.end ||
                    nextAya < selectedRange.start
                ) {
                    nextAya = selectedRange.start;
                }
                break;
            case AudioRepeat.page: //page
                const currPage = ayaIdPage(nextAya);
                const nextPage = ayaIdPage(nextAya + offset);
                if (nextPage !== currPage) {
                    nextAya = getPageFirstAyaId(currPage);
                } else {
                    nextAya += offset;
                }
                break;
            case AudioRepeat.sura: //sura
                const currSura = ayaIdInfo(playingAya).sura;
                const nextSura = ayaIdInfo(playingAya + offset).sura;
                if (currSura !== nextSura) {
                    nextAya = ayaID(currSura, 0);
                } else {
                    nextAya += offset;
                }
                break;
            case AudioRepeat.part: //part
                const currPart = getPartIndexByAyaId(playingAya);
                const nextPart = getPartIndexByAyaId(playingAya + offset);
                if (currPart !== nextPart) {
                    nextAya = getPartFirstAyaId(currPart);
                } else {
                    nextAya += offset;
                }
                break;
            default:
                //.noStop
                nextAya += offset;
        }

        if (nextAya < TOTAL_VERSES) {
            return nextAya;
        }
        return -1;
    };

    const onPlaying = () => {
        dispatch(setPlayingState(AudioState.playing));
    };
    const onWaiting = () => {
        dispatch(setPlayingState(AudioState.buffering));
    };
    const onPause = () => {
        dispatch(setPlayingState(AudioState.paused));
    };

    const onEnded = () => {
        const nextAya = offsetPlayingAya(1);
        dispatch(setPlayingAya(nextAya));
        if (nextAya === -1) {
            dispatch(setPlayingState(AudioState.stopped));
        } else {
            play(nextAya);
        }
    };

    const play = (ayaId) => {
        const playedAya = ayaId !== undefined ? ayaId : selectedRange.start;
        player.setAttribute("src", selectAudioSource(ayaId)(store.getState()));
        player.play();
        dispatch(setPlayingAya(playedAya));
        if (followPlayer) {
            //dispatch(setc)
        }
    };

    const pause = () => {
        player?.pause();
    };

    const stop = () => {
        player?.stop();
    };

    return (
        <AudioContext.Provider value={{ play, pause, stop }}>
            <audio
                ref={audioRef}
                onPlaying={onPlaying}
                onEnded={onEnded}
                onPause={onPause}
                onWaiting={onWaiting}
            />
            {children}
        </AudioContext.Provider>
    );
}
