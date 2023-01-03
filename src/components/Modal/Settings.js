import { faLanguage } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon as Icon } from "@fortawesome/react-fontawesome";
import React, { useContext } from "react";
import { FormattedMessage as Message } from "react-intl";
import { useDispatch, useSelector } from "react-redux";
import Switch from "react-switch";
import useSnapHeightToBottomOf from "../../hooks/useSnapHeightToBottomOff";
import { AppRefs } from "../../RefsProvider";
import { analytics } from "../../services/Analytics";
import { ListReciters } from "../../services/AudioData";
import {
    selectAppHeight,
    selectIsNarrow,
    selectPopupWidth,
} from "../../store/layoutSlice";
import {
    AudioState,
    selectAudioState,
    selectPlayingAya,
} from "../../store/playerSlice";
import {
    changeReciter,
    selectFollowPlayer,
    selectLang,
    selectReciter,
    selectRepeat,
    selectTheme,
    setFollowPlayer,
    setLang,
    setRepeat,
    setTheme,
} from "../../store/settingsSlice";
import { selectPopup } from "../../store/uiSlice";
import { PlayerButtons } from "../AudioPlayer/AudioPlayer";
import { ExerciseSettings } from "../ExerciseSettings";
import { VerseInfo } from "../Widgets";
import ReciterName from "./../AudioPlayer/ReciterName";

const Settings = () => {
    const lang = useSelector(selectLang);
    const theme = useSelector(selectTheme);
    const dispatch = useDispatch();
    const popupWidth = useSelector(selectPopupWidth);
    const appHeight = useSelector(selectAppHeight);
    const bodyRef = useSnapHeightToBottomOf(appHeight - 15);
    const isNarrow = useSelector(selectIsNarrow);
    const popup = useSelector(selectPopup);
    const playingAya = useSelector(selectPlayingAya);
    const repeat = useSelector(selectRepeat);
    const followPlayer = useSelector(selectFollowPlayer);
    const activeReciter = useSelector(selectReciter);
    const audioState = useSelector(selectAudioState);
    const audio = useContext(AppRefs).get("audio");

    const recitersList = ListReciters("ayaAudio");
    const [buttonWidth, outerMargin, scrollBarWidth] = [90, 30, 20];
    const recitersListWidth = popupWidth - outerMargin - scrollBarWidth;
    const recitersPerRow = Math.floor(recitersListWidth / buttonWidth);
    const recitersRowsCount = Math.floor(
        (recitersList.length - 1) / recitersPerRow + 1
    );
    const recitersHeight = recitersRowsCount * buttonWidth + 15;
    const centerPadding =
        (recitersListWidth - recitersPerRow * buttonWidth) / 2;

    const onChangeRepeat = ({ currentTarget }) => {
        const repeat = parseInt(currentTarget.value);
        dispatch(setRepeat(repeat));
        localStorage.setItem("repeat", repeat);
        analytics.logEvent("set_repeat", { repeat, trigger: popup });
        if (playingAya) {
            audio.setupRepeatRange(playingAya, repeat);
        }
    };

    const updateFollowPlayer = (checked) => {
        dispatch(setFollowPlayer(checked));
        localStorage.setItem("followPlayer", checked);
        analytics.logEvent(
            checked ? "set_follow_player" : "set_unfollow_player",
            {
                trigger: popup,
            }
        );
    };

    const onSelectReciter = ({ currentTarget }) => {
        const reciter = currentTarget.getAttribute("reciter");

        dispatch(changeReciter(reciter));
        bodyRef.current && (bodyRef.current.scrollTop = 0);
        analytics.logEvent("set_reciter", { reciter, trigger: popup });
        if (playingAya) {
            if (
                [AudioState.playing, AudioState.buffering].includes(audioState)
            ) {
                audio.play(playingAya, false); //restart playing aya, don't setup the repeat range
            } else if ([AudioState.paused].includes(audioState)) {
                audio.stop(); //change pause to stop
            }
        }
    };

    const onUpdateTheme = (checked) => {
        const theme_name = checked ? "Dark" : "Default";
        dispatch(setTheme(theme_name));
        localStorage.setItem("theme", theme_name);
        analytics.logEvent("set_theme", { theme_name, trigger: popup });
    };

    const updateLang = ({ currentTarget }) => {
        const lang = currentTarget.value;
        dispatch(setLang(lang));
        analytics.logEvent("set_lang", { lang, trigger: popup });
    };

    return (
        <>
            <div className="Title">
                <VerseInfo trigger="settings_title" verse={playingAya} />
                {isNarrow ? (
                    <PlayerButtons
                        trigger="settings_title"
                        showReciter={true}
                    />
                ) : (
                    ""
                )}
            </div>
            <div className="PopupBody" ref={bodyRef}>
                <div className="OptionRow">
                    <label>
                        <span>
                            <Icon icon={faLanguage} />
                        </span>
                        <select onChange={updateLang} value={lang}>
                            <option value="ar">عربي</option>
                            <option value="en">English</option>
                        </select>
                    </label>
                </div>
                <hr />
                <div className="OptionRow">
                    <label>
                        <span>
                            <Message id="dark_mode" />
                        </span>
                        <Switch
                            height={22}
                            width={42}
                            onChange={onUpdateTheme}
                            checked={theme === "Dark"}
                        />
                    </label>
                </div>
                <hr />
                <div>
                    <Message id="random_exercise" />:
                </div>
                <ExerciseSettings />
                <hr />
                <div className="OptionRow">
                    <label>
                        <span>
                            <Message id="followPlayer" />
                        </span>
                        <Switch
                            height={22}
                            width={42}
                            onChange={updateFollowPlayer}
                            checked={followPlayer}
                            // disabled={player.repeat == 1}
                        />
                    </label>
                </div>
                <div className="OptionRow">
                    <label>
                        <span>
                            <Message id="repeat" />
                        </span>
                        <select
                            // ref={(ref) => {
                            //     selectRepeat = ref;
                            // }}
                            onChange={onChangeRepeat}
                            value={repeat}
                        >
                            <Message id="no_repeat">
                                {(label) => <option value={0}>{label}</option>}
                            </Message>
                            <Message id="selection">
                                {(label) => <option value={1}>{label}</option>}
                            </Message>
                            <Message id="page">
                                {(label) => <option value={2}>{label}</option>}
                            </Message>
                            <Message id="sura">
                                {(label) => <option value={3}>{label}</option>}
                            </Message>
                            <Message id="part">
                                {(label) => <option value={4}>{label}</option>}
                            </Message>
                        </select>
                    </label>
                </div>
                <div
                    className="RecitersList"
                    style={{
                        height: recitersHeight,
                    }}
                >
                    {recitersList.map((reciter, index) => {
                        const row = Math.floor(index / recitersPerRow);
                        const top = row * 90;
                        const col = index - row * recitersPerRow;
                        // const left = col * buttonWidth + centerPadding;
                        const left =
                            recitersListWidth -
                            (col * buttonWidth + centerPadding) -
                            buttonWidth;
                        return (
                            <button
                                reciter={reciter}
                                key={reciter}
                                className={
                                    "ReciterButton" +
                                    (reciter === activeReciter
                                        ? " Selected"
                                        : "")
                                }
                                onClick={onSelectReciter}
                                style={{
                                    top,
                                    left,
                                }}
                            >
                                <img
                                    className="ReciterIcon"
                                    src={
                                        process.env.PUBLIC_URL +
                                        "/images/" +
                                        reciter +
                                        ".jpg"
                                    }
                                    alt="reciter"
                                />
                                <div>
                                    <ReciterName id={reciter} />
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </>
    );
};

export default Settings;
