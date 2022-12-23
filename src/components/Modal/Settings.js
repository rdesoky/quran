import { faLanguage } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon as Icon } from "@fortawesome/react-fontawesome";
import React, { useContext } from "react";
import { FormattedMessage as Message, useIntl } from "react-intl";
import { useDispatch, useSelector } from "react-redux";
import Switch from "react-switch";
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
    selectExerciseLevel,
    selectExerciseMemorized,
    selectFollowPlayer,
    selectLang,
    selectRandomAutoRecite,
    selectReciter,
    selectRepeat,
    selectTheme,
    setExerciseLevel,
    setExerciseMemorized,
    setFollowPlayer,
    setLang,
    setRandomAutoRecite,
    setRepeat,
    setTheme,
} from "../../store/settingsSlice";
import { selectPopup } from "../../store/uiSlice";
import { PlayerButtons } from "../AudioPlayer/AudioPlayer";
import { VerseInfo } from "../Widgets";
import ReciterName from "./../AudioPlayer/ReciterName";

const Settings = () => {
    const lang = useSelector(selectLang);
    const theme = useSelector(selectTheme);
    const dispatch = useDispatch();
    const popupWidth = useSelector(selectPopupWidth);
    const appHeight = useSelector(selectAppHeight);
    const isNarrow = useSelector(selectIsNarrow);
    const popup = useSelector(selectPopup);
    const playingAya = useSelector(selectPlayingAya);
    const repeat = useSelector(selectRepeat);
    const followPlayer = useSelector(selectFollowPlayer);
    const activeReciter = useSelector(selectReciter);
    const audioState = useSelector(selectAudioState);
    const audio = useContext(AppRefs).get("audio");

    let popupBody;

    const recitersList = ListReciters("ayaAudio");
    // const recitersList = useSelector(selectReciter);
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
        const repeat = currentTarget.value;
        dispatch(setRepeat(parseInt(repeat)));
        analytics.logEvent("set_repeat", { repeat, trigger: popup });
    };

    const updateFollowPlayer = (checked) => {
        dispatch(setFollowPlayer(checked));
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
        popupBody.scrollTop = 0;
        analytics.logEvent("set_reciter", { reciter, trigger: popup });
        if (playingAya) {
            audio.stop();
            if (audioState === AudioState.playing) {
                setTimeout(() => audio.play(playingAya));
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
            <div
                ref={(ref) => {
                    popupBody = ref;
                }}
                className="PopupBody"
                style={{
                    height: appHeight - 80,
                }}
            >
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
                        <Message id="repeat" />
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

export const ExerciseSettings = () => {
    const dispatch = useDispatch();
    const exerciseLevel = useSelector(selectExerciseLevel);
    const randomAutoRecite = useSelector(selectRandomAutoRecite);
    const exerciseMemorized = useSelector(selectExerciseMemorized);
    const intl = useIntl();

    const updateExerciseLevel = ({ currentTarget }) => {
        const exerciseLevel = parseInt(currentTarget.value);
        // settings.setExerciseLevel(exerciseLevel);
        dispatch(setExerciseLevel(exerciseLevel));
        localStorage.setItem("exerciseLevel", exerciseLevel);
    };

    const updateExerciseMemorized = (checked) => {
        dispatch(setExerciseMemorized(checked));
        localStorage.setItem("exerciseMemorized", checked);
    };

    const updateRandomAutoRecite = (checked) => {
        dispatch(setRandomAutoRecite(checked));
        localStorage.setItem("randomAutoRecite", checked);
    };

    return (
        <>
            <div className="OptionRow">
                <label>
                    <Message id="exercise_level" />
                    <select
                        onChange={updateExerciseLevel}
                        value={exerciseLevel}
                    >
                        <option value={0}>
                            {intl.formatMessage({
                                id: "beginner_level",
                            })}
                        </option>
                        <option value={1}>
                            {intl.formatMessage({
                                id: "moderate_level",
                            })}
                        </option>
                        <option value={2}>
                            {intl.formatMessage({ id: "high_level" })}
                        </option>
                        <option value={3}>
                            {intl.formatMessage({
                                id: "advanced_level",
                            })}
                        </option>
                    </select>
                </label>
            </div>
            <div className="OptionRow">
                <label>
                    <span>
                        <Message id="exercise_memorized" />
                    </span>
                    <Switch
                        height={22}
                        width={42}
                        onChange={updateExerciseMemorized}
                        checked={exerciseMemorized || false}
                    />
                </label>
            </div>
            <div className="OptionRow">
                <label>
                    <span>
                        <Message id="random_auto_recite" />
                    </span>
                    <Switch
                        height={22}
                        width={42}
                        onChange={updateRandomAutoRecite}
                        checked={randomAutoRecite || false}
                    />
                </label>
            </div>
        </>
    );
};
export default Settings;
