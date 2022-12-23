import { useCallback, useContext, useEffect, useRef } from "react";
import { useIntl } from "react-intl";
import { useDispatch, useSelector, useStore } from "react-redux";
import { useHistory } from "react-router-dom";
import { AppRefs } from "../RefsProvider";
import {
    ayaID,
    ayaIdInfo,
    ayaIdPage,
    getPageFirstAyaId,
    getPartFirstAyaId,
    getPartIndexByAyaId,
    TOTAL_VERSES,
} from "../services/QData";
import { getSuraName } from "../services/utils";
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
import {
    AudioRepeat,
    selectFollowPlayer,
    selectRepeat,
} from "../store/settingsSlice";

export function Audio() {
    const refs = useContext(AppRefs);
    const audioRef = useRef();
    const dispatch = useDispatch();
    const audioState = useSelector(selectAudioState);
    const playingAya = useSelector(selectPlayingAya);
    const followPlayer = useSelector(selectFollowPlayer);
    const repeat = useSelector(selectRepeat);
    const store = useStore();
    const selectedRange = useSelector(selectSelectedRange);
    const history = useHistory();
    const intl = useIntl();
    let audio = audioRef.current;

    useEffect(() => {
        let docTitle = intl.formatMessage({ id: "app_name" });
        if (playingAya !== -1) {
            const ayaInfo = ayaIdInfo(playingAya);
            docTitle = `${intl.formatMessage({ id: "play" })}: ${getSuraName(
                intl,
                ayaInfo.sura
            )} (${ayaInfo.aya + 1}) - ${docTitle}`;
        }
        document.title = docTitle;
    }, [playingAya, audioState, intl]);

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
        // dispatch(setAudioState(AudioState.paused));
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

    const play = useCallback(
        (ayaId) => {
            const playedAya = ayaId !== undefined ? ayaId : selectedRange.start;
            const audioSource = selectAudioSource(playedAya)(store.getState());
            audioRef.current.setAttribute("src", audioSource);
            audioRef.current.play();
            dispatch(setPlayingAya(playedAya));
            if (followPlayer) {
                dispatch(gotoAya(history, playedAya, { sel: true }));
            }
        },
        [dispatch, followPlayer, history, selectedRange.start, store]
    );

    const pause = useCallback(() => {
        audioRef.current?.pause();
        dispatch(setAudioState(AudioState.paused));
    }, [dispatch]);

    const resume = useCallback(() => {
        audioRef.current?.play();
    }, []);

    const stop = useCallback(() => {
        audioRef.current?.pause();
        dispatch(setPlayingAya(-1));
        dispatch(setAudioState(AudioState.stopped));
    }, [dispatch]);

    useEffect(() => {
        refs.add("audio", {
            play,
            stop,
            pause,
            resume,
        });
    }, [pause, play, stop, refs, resume]);

    const onDurationChange = (e) => {
        dispatch(setTrackDuration(audio.duration));
    };

    return (
        <audio
            ref={audioRef}
            onPlaying={onPlaying}
            onEnded={onEnded}
            onPause={onPause}
            onWaiting={onWaiting}
            onDurationChange={onDurationChange}
        />
    );
}
