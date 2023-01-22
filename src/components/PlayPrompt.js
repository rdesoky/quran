import React, { useCallback, useEffect, useState } from "react";
import { FormattedMessage as Message } from "react-intl";
import { useDispatch, useSelector } from "react-redux";
import Switch from "react-switch";
import useSuraName from "../hooks/useSuraName";
import { useAudio } from "../RefsProvider";
import { analytics } from "../services/Analytics";
import {
    ayaID,
    ayaIdInfo,
    getPageFirstAyaId,
    verseLocation,
} from "../services/QData";
import { checkActiveInput } from "../services/utils";
import { selectActivePage, selectAppHeight } from "../store/layoutSlice";
import { selectSelectedRange } from "../store/navSlice";
import {
    AudioState,
    selectAudioState,
    selectPlayingAya,
    selectRepeatEnd,
    selectRepeatStart,
} from "../store/playerSlice";
import {
    AudioRepeat,
    selectFollowPlayer,
    selectLang,
    selectReciter,
    setFollowPlayer,
} from "../store/settingsSlice";
import { PlayerButtons } from "./AudioPlayer/PlayerButtons";
import ReciterName from "./AudioPlayer/ReciterName";
import AyaName from "./AyaName";
import { CommandButton } from "./CommandButton";
import PlayerCountDown from "./PlayerCountDown";
import RecitersGrid from "./RecitersGrid";
import SuraName from "./SuraName";
import { VerseInfo } from "./VerseInfo";

export default function PlayPrompt({ trigger, showReciters }) {
    const [selectedScope, setSelectedScope] = useState(-1);
    const pageIndex = useSelector(selectActivePage);
    const suraName = useSuraName();
    const audio = useAudio();
    const reciter = useSelector(selectReciter);
    const lang = useSelector(selectLang);
    const dispatch = useDispatch();
    const selection = useSelector(selectSelectedRange);
    const ayaInfo = ayaIdInfo(selection.start);
    const selectedSuraName = useSuraName(ayaInfo.sura);
    const followPlayer = useSelector(selectFollowPlayer);
    const playingAya = useSelector(selectPlayingAya);
    const [_showReciters, setShowReciters] = useState(showReciters);
    const appHeight = useSelector(selectAppHeight);
    const audioState = useSelector(selectAudioState);
    const repeatStart = useSelector(selectRepeatStart);
    const repeatEnd = useSelector(selectRepeatEnd);

    useEffect(() => {
        switch (trigger) {
            case "page_context":
                setSelectedScope(AudioRepeat.page);
                break;
            case "page_header":
            case "surah_context":
                setSelectedScope(AudioRepeat.sura);
                break;
            case "bookmarks_title":
            case "tafseer_title":
            case "player_buttons":
            case "verse_context":
                setSelectedScope(AudioRepeat.selection);
                break;
            case "commands_title":
            case "side_bar":
            case "settings_title":
            default:
                setSelectedScope(AudioRepeat.noStop);
        }
    }, [trigger]);

    const onScopeChange = (e) => {
        setSelectedScope(parseInt(e.target.value));
    };

    const onPause = useCallback(() => {
        analytics.logEvent("pause_audio", {
            ...verseLocation(playingAya),
            reciter,
            trigger,
        });
        audioState === AudioState.playing ? audio.pause() : audio.resume();
    }, [audio, audioState, playingAya, reciter, trigger]);

    const onStop = useCallback(() => {
        analytics.logEvent("stop_audio", {
            ...verseLocation(playingAya),
            reciter,
            trigger,
        });
        audio.stop();
    }, [audio, playingAya, reciter, trigger]);

    const onPlay = useCallback(() => {
        let aya = selection.start;
        switch (selectedScope) {
            case AudioRepeat.page:
                aya = getPageFirstAyaId(pageIndex);
                break;
            case AudioRepeat.sura:
                aya = ayaID(ayaInfo.sura, 0);
                break;
            default:
                break;
        }
        analytics.logEvent("play_audio", {
            trigger,
            ...verseLocation(aya),
        });
        audio.play(aya, selectedScope);
    }, [
        audio,
        ayaInfo.sura,
        pageIndex,
        selectedScope,
        selection.start,
        trigger,
    ]);

    const handleKeyDown = useCallback(
        (e) => {
            const { isTextInput } = checkActiveInput();
            if (isTextInput) {
                return;
            }
            switch (e.code) {
                case "Backspace":
                    if (_showReciters) {
                        setShowReciters(false);
                        e.stopPropagation();
                    }
                    break;
                case "KeyR":
                    onPlay();
                    break;
                case "KeyP":
                    onPause();
                    break;
                case "KeyS":
                    onStop();
                    break;
                default:
                    break;
            }
        },
        [_showReciters, onPause, onPlay, onStop]
    );

    useEffect(() => {
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [handleKeyDown]);

    const groupName = "playPrompt";

    const renderOption = ({ strId, value, strValues }) => (
        <div key={value}>
            <label>
                <input
                    type="radio"
                    name={groupName}
                    value={value}
                    checked={selectedScope === value}
                    onChange={onScopeChange}
                />
                <span>
                    <Message id={strId} values={strValues} />
                </span>
            </label>
        </div>
    );

    const updateFollowPlayer = (checked) => {
        dispatch(setFollowPlayer(checked));
        localStorage.setItem("followPlayer", checked);
        analytics.logEvent(
            checked ? "set_follow_player" : "set_unfollow_player",
            {
                trigger: trigger,
            }
        );
    };

    const onClickShowReciters = () => {
        setShowReciters(true);
    };

    const renderRadioOptions = () => {
        return (
            <>
                <div>
                    <Message id="repeat" />
                    {":"}
                </div>
                {[
                    {
                        value: AudioRepeat.selection,
                        strId: "selection",
                    },
                    {
                        value: AudioRepeat.page,
                        strId: "page_num",
                        strValues: { num: pageIndex + 1 },
                    },
                    {
                        value: AudioRepeat.sura,
                        strId: "sura_name",
                        strValues: { sura: suraName },
                    },
                ].map(renderOption)}
                <div style={{ marginTop: 10 }}>
                    <Message id="no_stop_recite_from" />
                    {":"}
                </div>
                {[
                    {
                        value: AudioRepeat.noStop,
                        strId: "sura_name_aya_num",
                        strValues: {
                            sura: selectedSuraName,
                            aya: ayaInfo.aya + 1,
                        },
                    },
                ].map(renderOption)}
            </>
        );
    };

    const renderReciteStatus = () => {
        return (
            <>
                <div className="ReciteStatus">
                    <div>
                        <Message id="playing_aya" />:
                    </div>
                    <div>
                        <AyaName index={playingAya} clickable={true} />
                    </div>
                    <div className="HACentered">
                        <PlayerCountDown sqSize={42} strokeWidth={4} />
                    </div>
                    <div style={{ marginTop: 15 }}>
                        <Message id="loop_start" />:
                    </div>
                    <div>
                        <AyaName index={repeatStart} clickable={true} />
                    </div>
                    <div>
                        <Message id="loop_end" />:
                    </div>
                    <div>
                        <AyaName index={repeatEnd} clickable={true} />
                    </div>
                </div>
            </>
        );
    };

    if (_showReciters) {
        return (
            <div
                id="PlayPrompt"
                style={{ height: appHeight - 100, overflowY: "overlay" }}
            >
                <RecitersGrid
                    onClick={() => {
                        setShowReciters(false);
                    }}
                />
            </div>
        );
    }

    return (
        <div id="PlayPrompt" style={{ height: appHeight - 100 }}>
            <div className="RadioGroup">
                <div
                    style={{
                        float: lang === "ar" ? "left" : "right",
                        margin: "0 10px",
                    }}
                    className="VACentered"
                >
                    <CommandButton
                        command="AudioPlayer"
                        onClick={onClickShowReciters}
                    />
                    <ReciterName />
                    <label className="VACentered" style={{ marginTop: 20 }}>
                        <Switch
                            height={22}
                            width={42}
                            onChange={updateFollowPlayer}
                            checked={followPlayer}
                        />
                        <div style={{ marginTop: 10 }}>
                            <Message id="followPlayer" />
                        </div>
                    </label>
                </div>
                {audioState === AudioState.stopped
                    ? renderRadioOptions()
                    : renderReciteStatus()}
            </div>
            <div className="PlayPrompt" style={{ padding: 0, marginTop: 10 }}>
                <PlayerButtons
                    {...{
                        trigger,
                        showLabels: true,
                        showReciter: false,
                        onPlay,
                        onStop,
                    }}
                />
            </div>
        </div>
    );
}
