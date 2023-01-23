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
    getPageLastAyaId,
    getPartFirstAyaId,
    getPartIndexByAyaId,
    TOTAL_PARTS,
    TOTAL_VERSES,
} from "../services/QData";
import { getSuraName } from "../services/utils";
import { selectActivePage, selectShownPages } from "../store/layoutSlice";
import { gotoPage, selectSelectedRange } from "../store/navSlice";
import {
    AudioState,
    selectAudioSource,
    selectAudioState,
    selectPlayingAya,
    selectRepeatRange,
    setAudioState,
    setPlayingAya,
    setRemainingTime,
    setRepeatRange,
    setTrackDuration,
} from "../store/playerSlice";
import {
    AudioRepeat,
    selectFollowPlayer,
    selectRepeat,
} from "../store/settingsSlice";

export function Audio() {
    const appRefs = useContext(AppRefs);
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
    const repeatRange = useSelector(selectRepeatRange);
    const activePageIndex = useSelector(selectActivePage);
    const shownPages = useSelector(selectShownPages);

    let audio = audioRef.current;

    useEffect(() => {
        let docTitle =
            intl.formatMessage({ id: "app_name" }) +
            " - " +
            intl.formatMessage(
                { id: "page_num" },
                { num: activePageIndex + 1 }
            );
        if (playingAya !== -1) {
            const ayaInfo = ayaIdInfo(playingAya);
            docTitle = `${intl.formatMessage({ id: "start" })}: ${getSuraName(
                intl,
                ayaInfo.sura
            )} (${ayaInfo.aya + 1}) - ${docTitle}`;
        }
        document.title = docTitle;
    }, [playingAya, audioState, intl, activePageIndex]);

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
        if (repeatRange.end === -1) {
            return -1; //no repeat
        }

        let nextAya = playingAya + offset;
        if (nextAya <= repeatRange.end) {
            return nextAya;
        }
        return repeatRange.start;
    };

    const onPlaying = useCallback(() => {
        dispatch(setAudioState(AudioState.playing));
        if (followPlayer) {
            const playingPage = ayaIdPage(playingAya);
            if (activePageIndex !== playingPage) {
                dispatch(gotoPage(history, playingPage, { sel: false }));
            }
        }
    }, [activePageIndex, dispatch, followPlayer, history, playingAya]);

    const onWaiting = useCallback(() => {
        dispatch(setAudioState(AudioState.buffering));
    }, [dispatch]);

    const onPause = useCallback(() => {
        // dispatch(setAudioState(AudioState.paused));
    }, []);

    const setupRepeatRange = useCallback(
        (playedAya, repeat) => {
            let start, end;
            switch (repeat) {
                case AudioRepeat.selection:
                    start = selectedRange.start;
                    end = selectedRange.end;
                    break;
                case AudioRepeat.page:
                    const page = ayaIdPage(playedAya);
                    start = getPageFirstAyaId(page);
                    end = getPageLastAyaId(page);
                    break;
                case AudioRepeat.sura:
                    const ayaInfo = ayaIdInfo(playedAya);
                    start = ayaID(ayaInfo.sura, 0);
                    end = start + ayaInfo.ac - 1;
                    break;
                case AudioRepeat.part:
                    const currPart = getPartIndexByAyaId(playedAya);
                    start = getPartFirstAyaId(currPart);
                    end =
                        currPart + 1 < TOTAL_PARTS
                            ? getPartFirstAyaId(currPart + 1) - 1
                            : TOTAL_VERSES - 1;
                    break;
                case AudioRepeat.noStop:
                    start = 0;
                    end = TOTAL_VERSES - 1;
                    break;
                case AudioRepeat.noRepeat: //no repeat
                // eslint-disable-next-line no-fallthrough
                default:
                    start = playedAya;
                    end = -1;
            }
            dispatch(setRepeatRange({ start, end }));
        },
        [dispatch, selectedRange.end, selectedRange.start]
    );

    const play = useCallback(
        (ayaId, setupRepeat = true) => {
            const playedAya = ayaId !== undefined ? ayaId : selectedRange.start;
            const audioSource = selectAudioSource(playedAya)(store.getState());
            audioRef.current.setAttribute("src", audioSource);
            audioRef.current.play();
            dispatch(setPlayingAya(playedAya));
            if (followPlayer) {
                const ayaPage = ayaIdPage(playedAya);
                if (!shownPages.includes(ayaPage)) {
                    //TODO: scroll to playing aya
                    dispatch(gotoPage(history, ayaPage, { sel: false }));
                }
            }
            switch (setupRepeat) {
                case false: //no setup
                    break;
                case true: //auto setup
                    setupRepeatRange(playedAya, repeat);
                    break;
                default: //setup with given repeat
                    setupRepeatRange(playedAya, setupRepeat);
            }
        },
        [
            selectedRange.start,
            store,
            followPlayer,
            dispatch,
            shownPages,
            history,
            setupRepeatRange,
            repeat,
        ]
    );

    const onEnded = () => {
        const nextAya = offsetPlayingAya(1);
        if (nextAya === -1) {
            dispatch(setAudioState(AudioState.stopped));
            dispatch(setPlayingAya(-1));
            return;
        }

        play(nextAya, false);
    };

    const pause = useCallback(() => {
        audioRef.current?.pause();
        dispatch(setAudioState(AudioState.paused));
    }, [dispatch]);

    const resume = useCallback(() => {
        if (playingAya !== -1) {
            audioRef.current?.play();
        }
    }, [playingAya]);

    const stop = useCallback(() => {
        audioRef.current?.pause();
        dispatch(setPlayingAya(-1));
        dispatch(setAudioState(AudioState.stopped));
    }, [dispatch]);

    useEffect(() => {
        appRefs.add("audio", {
            play,
            stop,
            pause,
            resume,
            setupRepeatRange,
        });
    }, [pause, play, appRefs, resume, setupRepeatRange, stop]);

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
