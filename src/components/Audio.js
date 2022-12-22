import { createContext, useEffect, useRef } from "react";
import { useDispatch, useSelector, useStore } from "react-redux";
import { useHistory } from "react-router-dom";
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
import { gotoAya, selectSelectedRange } from "../store/navSlice";
import {
    AudioState,
    selectAudioSource,
    selectAudioState,
    selectPlayingAya,
    setAudioState,
    setPlayingAya,
    setRemainingTime,
    setTrackDuration,
} from "../store/playerSlice";
import { selectFollowPlayer, selectRepeat } from "../store/settingsSlice";

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
    const selectedRange = useSelector(selectSelectedRange);
    const history = useHistory();
    let audio = audioRef.current;

    useEffect(() => {
        let updateRemainingTimeInterval;
        const updateRemainingTime = () => {
            dispatch(setRemainingTime(audio?.duration - audio?.currentTime));
        };
        if (audioState === AudioState.playing) {
            updateRemainingTimeInterval = setInterval(
                updateRemainingTime,
                1000
            );
        }
        return () => {
            if (updateRemainingTimeInterval) {
                clearInterval(updateRemainingTimeInterval);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [audioState, dispatch]);

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
        dispatch(setAudioState(AudioState.playing));
    };
    const onWaiting = () => {
        dispatch(setAudioState(AudioState.buffering));
    };
    const onPause = () => {
        dispatch(setAudioState(AudioState.paused));
    };

    const onEnded = () => {
        const nextAya = offsetPlayingAya(1);
        dispatch(setPlayingAya(nextAya));
        if (nextAya === -1) {
            dispatch(setAudioState(AudioState.stopped));
        } else {
            play(nextAya);
        }
    };

    const play = (ayaId) => {
        const playedAya = ayaId !== undefined ? ayaId : selectedRange.start;
        audio.setAttribute("src", selectAudioSource(ayaId)(store.getState()));
        audio.play();
        dispatch(setPlayingAya(playedAya));
        if (followPlayer) {
            dispatch(gotoAya(history, playedAya, { sel: true }));
        }
    };

    const pause = () => {
        audio?.pause();
    };

    const stop = () => {
        audio?.stop();
    };

    const trackRemainingTime = () => {
        return audio?.duration - audio?.currentTime;
    };
    const onDurationChange = (e) => {
        dispatch(setTrackDuration(audio.duration));
    };

    return (
        <AudioContext.Provider
            value={{ play, pause, stop, trackRemainingTime }}
        >
            <audio
                ref={audioRef}
                onPlaying={onPlaying}
                onEnded={onEnded}
                onPause={onPause}
                onWaiting={onWaiting}
                onDurationChange={onDurationChange}
            />
            {children}
        </AudioContext.Provider>
    );
}
