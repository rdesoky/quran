import React, { useEffect, useState } from "react";
import {
    FormattedMessage as Message,
    FormattedMessage as String,
} from "react-intl";
import { useAudio, useMessageBox } from "../RefsProvider";
import {
    AudioRepeat,
    changeReciter,
    selectFollowPlayer,
    selectLang,
    selectReciter,
    setFollowPlayer,
} from "../store/settingsSlice";
import useSuraName from "../hooks/useSuraName";
import { selectActivePage } from "../store/layoutSlice";
import { useDispatch, useSelector } from "react-redux";
import { analytics } from "../services/Analytics";
import {
    ayaID,
    ayaIdInfo,
    getPageFirstAyaId,
    verseLocation,
} from "../services/QData";
import { selectSelectedRange } from "../store/navSlice";
import { CommandIcon } from "./CommandIcon";
import { ListReciters } from "../services/AudioData";
import Switch from "react-switch";

export default function PlayPrompt({ trigger }) {
    const [selectedScope, setSelectedScope] = useState(-1);
    const pageIndex = useSelector(selectActivePage);
    const msgBox = useMessageBox();
    const suraName = useSuraName();
    const audio = useAudio();
    const reciter = useSelector(selectReciter);
    const [reciters] = useState(() => ListReciters("ayaAudio"));
    const lang = useSelector(selectLang);
    const dispatch = useDispatch();
    const selection = useSelector(selectSelectedRange);
    const ayaInfo = ayaIdInfo(selection.start);
    const selectedSuraName = useSuraName(ayaInfo.sura);
    const followPlayer = useSelector(selectFollowPlayer);

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
    const onPlay = () => {
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
        msgBox.pop();
    };
    const groupName = "playPrompt";

    function onSelectReciter(e) {
        dispatch(changeReciter(e.target.value));
    }

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
                    <String id={strId} values={strValues} />
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

    return (
        <div>
            <div className="HACentered">
                <select
                    value={reciter}
                    onChange={onSelectReciter}
                    style={{
                        flexGrow: 1,
                        marginBottom: 15,
                        fontSize: 16,
                        padding: 4,
                    }}
                >
                    {reciters.map((r) => (
                        <option value={r} key={r}>
                            <String id={"r." + r} />
                        </option>
                    ))}
                </select>
            </div>
            <div
                style={{
                    float: lang === "ar" ? "left" : "right",
                    margin: "0 10px",
                }}
                className="VACentered"
            >
                <img
                    className="ReciterIcon"
                    src={process.env.PUBLIC_URL + "/images/" + reciter + ".jpg"}
                    alt="reciter"
                />
                <label className="VACentered" style={{ margin: "10px 0" }}>
                    <div>
                        <Message id="followPlayer" />
                    </div>
                    <Switch
                        height={22}
                        width={42}
                        onChange={updateFollowPlayer}
                        checked={followPlayer}
                        // disabled={player.repeat == 1}
                    />
                </label>
            </div>
            <div className="RadioGroup">
                <div>
                    <String id="repeat" />
                    {":"}
                </div>
                {[
                    { value: AudioRepeat.selection, strId: "selection" },
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
                    <String id="no_stop_recite_from" />
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
            </div>
            <div className="ButtonsBar" style={{ padding: 0, marginTop: 10 }}>
                <button onClick={onPlay} style={{ padding: 10 }}>
                    <CommandIcon command="Play" />
                    <div style={{ margin: "0 10px", fontSize: 16 }}>
                        <String id="start" />
                    </div>
                </button>
            </div>
        </div>
    );
}
