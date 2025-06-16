import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useIntl } from "react-intl";
import { useDispatch, useSelector, useStore } from "react-redux";
import { useHistory } from "@/hooks/useHistory";
import { AppRefs } from "@/RefsProvider";
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
} from "@/services/qData";
import { getSuraName } from "@/services/utils";
import { selectActivePage, selectShownPages } from "@/store/layoutSlice";
import { gotoPage, selectSelectedRange } from "@/store/navSlice";
import {
    AudioState,
    selectAudioSource,
    selectAudioState,
    selectPlayingAya,
    selectReciteRange,
    setAudioState,
    setPlayingAya,
    setRemainingTime,
    setReciteRange,
    setTrackDuration,
} from "@/store/playerSlice";
import {
    AudioRange,
    selectFollowPlayer,
    selectReciter,
    selectRepeat,
} from "@/store/settingsSlice";

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
    const reciteRange = useSelector(selectReciteRange);
    const activePageIndex = useSelector(selectActivePage);
    const shownPages = useSelector(selectShownPages);
    const activeReciter = useSelector(selectReciter);
    const [playingReciter, setPlayingReciter] = useState(null);

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

    const offsetPlayingAya = useCallback(
        (offset) => {
            if (reciteRange.end === -1) {
                return -1; //no repeat
            }

            let nextAya = playingAya + offset;
            if (nextAya <= reciteRange.end) {
                return nextAya;
            }
            if (repeat) {
                return reciteRange.start;
            }
            return -1;
        },
        [playingAya, reciteRange.end, reciteRange.start, repeat]
    );

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

    const setupReciteRange = useCallback(
        (playedAya, range) => {
            let start, end;
            switch (range) {
                case AudioRange.selection:
                    start = selectedRange.start;
                    end = selectedRange.end;
                    break;
                case AudioRange.page:
                    const page = ayaIdPage(playedAya);
                    start = getPageFirstAyaId(page);
                    end = getPageLastAyaId(page);
                    break;
                case AudioRange.sura:
                    const ayaInfo = ayaIdInfo(playedAya);
                    start = ayaID(ayaInfo.sura, 0);
                    end = start + ayaInfo.ac - 1;
                    break;
                case AudioRange.part:
                    const currPart = getPartIndexByAyaId(playedAya);
                    start = getPartFirstAyaId(currPart);
                    end =
                        currPart + 1 < TOTAL_PARTS
                            ? getPartFirstAyaId(currPart + 1) - 1
                            : TOTAL_VERSES - 1;
                    break;
                case AudioRange.continuous:
                    start = 0;
                    end = TOTAL_VERSES - 1;
                    break;
                case AudioRange.exercise: //exercise mode
                // eslint-disable-next-line no-fallthrough
                default:
                    start = playedAya;
                    end = -1;
            }
            dispatch(setReciteRange({ start, end }));
        },
        [dispatch, selectedRange.end, selectedRange.start]
    );

    const play = useCallback(
        (ayaId, setupRange = true) => {
            setPlayingReciter(activeReciter);
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
            switch (setupRange) {
                case false: //no setup
                    break;
                // case true: //auto setup
                //     setupReciteRange(playedAya, repeat);
                //     break;
                default: //setup with given repeat
                    setupReciteRange(playedAya, setupRange);
            }
        },
        [
            selectedRange.start,
            store,
            followPlayer,
            dispatch,
            shownPages,
            history,
            setupReciteRange,
            activeReciter,
        ]
    );

    const onEnded = useCallback(() => {
        const nextAya = offsetPlayingAya(1);
        if (nextAya === -1) {
            dispatch(setAudioState(AudioState.stopped));
            dispatch(setPlayingAya(-1));
            return;
        }

        play(nextAya, false);
    }, [dispatch, offsetPlayingAya, play]);

    const pause = useCallback(() => {
        audioRef.current?.pause();
        dispatch(setAudioState(AudioState.paused));
    }, [dispatch]);

    const resume = useCallback(() => {
        if (playingAya !== -1) {
            if (activeReciter !== playingReciter) {
                play(playingAya, false); //re-set audio source
            } else {
                audioRef.current?.play();
            }
        }
    }, [playingAya, activeReciter, playingReciter, play]);

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
            setupReciteRange, //TODO: unused
        });
    }, [pause, play, appRefs, resume, setupReciteRange, stop]);

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
