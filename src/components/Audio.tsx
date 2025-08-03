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
    setReciteRange,
    setRemainingTime,
    setTrackDuration,
} from "@/store/playerSlice";
import {
    AudioRange,
    AudioRangeProp,
    selectFollowPlayer,
    selectReciter,
    selectRepeat,
} from "@/store/settingsSlice";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useIntl } from "react-intl";
import { useDispatch, useSelector, useStore } from "react-redux";

export function Audio() {
    const appRefs = useContext(AppRefs);
    const audioRef = useRef<HTMLAudioElement>(null);
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
    const [playingReciter, setPlayingReciter] = useState<ReciterID | null>(
        null
    );

    // const audio = audioRef.current;

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
        let updateRemainingTimeInterval: number | null = null;
        const updateRemainingTime = () => {
            dispatch(
                setRemainingTime(
                    Number(audioRef.current?.duration) -
                        Number(audioRef.current?.currentTime)
                )
            );
        };
        if (audioState === AudioState.playing) {
            updateRemainingTimeInterval = window.setInterval(
                updateRemainingTime,
                1000
            );
        }
        return () => {
            if (updateRemainingTimeInterval) {
                window.clearInterval(updateRemainingTimeInterval);
            }
        };
    }, [audioState, dispatch]);

    const offsetPlayingAya = useCallback(
        (offset: number) => {
            if (reciteRange.end === -1) {
                return -1; //no repeat
            }

            const nextAya = playingAya + offset;
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
        (playedAya: number, range: AudioRangeProp) => {
            let start, end;
            switch (range) {
                case AudioRange.selection:
                    start = selectedRange.start;
                    end = selectedRange.end;
                    break;
                case AudioRange.page:
                    {
                        const page = ayaIdPage(playedAya);
                        start = getPageFirstAyaId(page);
                        end = getPageLastAyaId(page);
                    }
                    break;
                case AudioRange.sura:
                    {
                        const ayaInfo = ayaIdInfo(playedAya);
                        start = ayaID(ayaInfo.sura, 0);
                        end = start + ayaInfo.ac - 1;
                    }
                    break;
                case AudioRange.part:
                    {
                        const currPart = getPartIndexByAyaId(playedAya);
                        start = getPartFirstAyaId(currPart);
                        end =
                            currPart + 1 < TOTAL_PARTS
                                ? getPartFirstAyaId(currPart + 1) - 1
                                : TOTAL_VERSES - 1;
                    }
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
        (ayaId: number, setupRange: AudioRangeProp | false) => {
            setPlayingReciter(activeReciter);
            const playedAya = ayaId !== undefined ? ayaId : selectedRange.start;
            const audioSource = selectAudioSource(playedAya)(store.getState());
            if (audioSource) {
                audioRef.current?.setAttribute("src", audioSource);
                audioRef.current?.play();
                dispatch(setPlayingAya(playedAya));
                if (followPlayer) {
                    const ayaPage = ayaIdPage(playedAya);
                    if (!shownPages.includes(ayaPage)) {
                        //TODO: scroll to playing aya
                        dispatch(gotoPage(history, ayaPage, { sel: false }));
                    }
                }
            } else {
                audioRef.current?.removeAttribute("src");
                audioRef.current?.pause();
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

    const onDurationChange = () => {
        dispatch(setTrackDuration(audioRef.current?.duration));
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
