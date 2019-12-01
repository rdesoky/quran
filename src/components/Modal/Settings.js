import React, { useContext } from "react";
import { FormattedMessage as String } from "react-intl";
import { AppContext } from "../../context/App";
import { AudioState, PlayerContext } from "../../context/Player";
import ReciterName from "./../AudioPlayer/ReciterName";
import { ListReciters } from "./../../services/AudioData";
import Switch from "react-switch";
import { VerseInfo } from "./../Widgets";
import { PlayerButtons } from "./../AudioPlayer/AudioPlayer";
import { ThemeContext } from "../../context/Theme";
import { SettingsContext } from "../../context/Settings";

// const Settings = (onClose, isOpen) => {
// 	return (
// 		<div className="Title">
// 			<FormattedMessage id="settings" />
// 		</div>

// 	);
// };

const Settings = () => {
    const player = useContext(PlayerContext);
    const app = useContext(AppContext);
    const theme = useContext(ThemeContext);
    const settings = useContext(SettingsContext);

    let popupBody;
    let selectRepeat;

    const recitersList = ListReciters("ayaAudio");
    const [buttonWidth, outerMargin, scrollBarWidth] = [90, 30, 20];
    const recitersListWidth = app.popupWidth() - outerMargin - scrollBarWidth;
    const recitersPerRow = Math.floor(recitersListWidth / buttonWidth);
    const recitersRowsCount = Math.floor(
        (recitersList.length - 1) / recitersPerRow + 1
    );
    const recitersHeight = recitersRowsCount * buttonWidth + 15;
    const centerPadding =
        (recitersListWidth - recitersPerRow * buttonWidth) / 2;

    const onChangeRepeat = ({ currentTarget }) => {
        const repeat = currentTarget.value;
        player.setRepeat(parseInt(repeat));
    };

    const updateFollowPlayer = checked => {
        player.setFollowPlayer(checked);
    };

    const selectReciter = ({ currentTarget }) => {
        const reciter = currentTarget.getAttribute("reciter");
        player.changeReciter(reciter);
        popupBody.scrollTop = 0;
    };

    const updateTheme = checked => {
        theme.setTheme(checked ? "Dark" : "Default");
    };

    const updateExerciseLevel = ({ currentTarget }) => {
        const exerciseLevel = parseInt(currentTarget.value);
        settings.setExerciseLevel(exerciseLevel);
    };

    const updateExerciseMemorized = checked => {
        settings.setExerciseMemorized(checked);
    };

    return (
        <>
            <div className="Title">
                <VerseInfo verse={player.playingAya} />
                {app.isNarrow ? <PlayerButtons showReciter={false} /> : ""}
            </div>
            <div
                ref={ref => {
                    popupBody = ref;
                }}
                className="PopupBody"
                style={{
                    height: app.appHeight - 80
                }}
            >
                <div className="OptionRow">
                    <label>
                        <span>
                            <String id="dark_mode" />
                        </span>
                        <Switch
                            height={22}
                            width={42}
                            onChange={updateTheme}
                            checked={theme.theme === "Dark"}
                        />
                    </label>
                </div>
                <hr />
                <div>
                    <String id="random_exercise" />:
                </div>
                <div className="OptionRow">
                    <label>
                        <String id="exercise_level" />
                        <select
                            onChange={updateExerciseLevel}
                            value={settings.exerciseLevel}
                        >
                            <option value={0}>
                                {app.formatMessage({ id: "beginner_level" })}
                            </option>
                            <option value={1}>
                                {app.formatMessage({ id: "moderate_level" })}
                            </option>
                            <option value={2}>
                                {app.formatMessage({ id: "high_level" })}
                            </option>
                            <option value={3}>
                                {app.formatMessage({ id: "advanced_level" })}
                            </option>
                        </select>
                    </label>
                </div>
                <div className="OptionRow">
                    <label>
                        <span>
                            <String id="exercise_memorized" />
                        </span>
                        <Switch
                            height={22}
                            width={42}
                            onChange={updateExerciseMemorized}
                            checked={settings.exerciseMemorized}
                        />
                    </label>
                </div>
                <hr />
                <div className="OptionRow">
                    <label>
                        <span>
                            <String id="followPlayer" />
                        </span>
                        <Switch
                            height={22}
                            width={42}
                            onChange={updateFollowPlayer}
                            checked={player.followPlayer}
                            // disabled={player.repeat == 1}
                        />
                    </label>
                </div>
                <div className="OptionRow">
                    <label>
                        <String id="repeat" />
                        <select
                            ref={ref => {
                                selectRepeat = ref;
                            }}
                            onChange={onChangeRepeat}
                            value={player.repeat}
                        >
                            <String id="no_repeat">
                                {label => <option value={0}>{label}</option>}
                            </String>
                            <String id="selection">
                                {label => <option value={1}>{label}</option>}
                            </String>
                            <String id="page">
                                {label => <option value={2}>{label}</option>}
                            </String>
                            <String id="sura">
                                {label => <option value={3}>{label}</option>}
                            </String>
                            <String id="part">
                                {label => <option value={4}>{label}</option>}
                            </String>
                        </select>
                    </label>
                </div>
                <div
                    className="RecitersList"
                    style={{
                        height: recitersHeight
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
                                    (player.reciter === reciter
                                        ? " Selected"
                                        : "")
                                }
                                onClick={selectReciter}
                                style={{
                                    top,
                                    left
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
