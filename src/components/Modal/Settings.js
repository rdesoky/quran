import { faLanguage } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon as Icon } from "@fortawesome/react-fontawesome";
import React from "react";
import { FormattedMessage as Message } from "react-intl";
import { useDispatch, useSelector } from "react-redux";
import Switch from "react-switch";
import useSnapHeightToBottomOf from "../../hooks/useSnapHeightToBottomOff";
import { analytics } from "../../services/Analytics";
import { selectAppHeight, selectIsNarrow } from "../../store/layoutSlice";
import { selectPlayingAya } from "../../store/playerSlice";
import {
    selectFollowPlayer,
    selectLang,
    selectTheme,
    setFollowPlayer,
    setLang,
    setTheme,
} from "../../store/settingsSlice";
import { selectPopup } from "../../store/uiSlice";
import { PlayerButtons } from "../AudioPlayer/PlayerButtons";
import { ExerciseSettings } from "../ExerciseSettings";
import RecitersGrid from "../RecitersGrid";
import { VerseInfo } from "../Widgets";

const Settings = () => {
    const lang = useSelector(selectLang);
    const theme = useSelector(selectTheme);
    const dispatch = useDispatch();
    const appHeight = useSelector(selectAppHeight);
    const bodyRef = useSnapHeightToBottomOf(appHeight - 15);

    const isNarrow = useSelector(selectIsNarrow);
    const popup = useSelector(selectPopup);
    const playingAya = useSelector(selectPlayingAya);
    const followPlayer = useSelector(selectFollowPlayer);

    // const onChangeRepeat = ({ currentTarget }) => {
    //   const repeat = parseInt(currentTarget.value);
    //   dispatch(setRepeat(repeat));
    //   localStorage.setItem("repeat", repeat);
    //   analytics.logEvent("set_repeat", { repeat, trigger: popup });
    //   if (playingAya) {
    //     audio.setupRepeatRange(playingAya, repeat);
    //   }
    // };

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
                {/*<div className="OptionRow">*/}
                {/*  <label>*/}
                {/*    <span>*/}
                {/*      <Message id="repeat" />*/}
                {/*    </span>*/}
                {/*    <select*/}
                {/*      onChange={onChangeRepeat}*/}
                {/*      value={repeat}*/}
                {/*    >*/}
                {/*      <Message id="no_repeat">*/}
                {/*        {(label) => <option value={0}>{label}</option>}*/}
                {/*      </Message>*/}
                {/*      <Message id="selection">*/}
                {/*        {(label) => <option value={1}>{label}</option>}*/}
                {/*      </Message>*/}
                {/*      <Message id="page">*/}
                {/*        {(label) => <option value={2}>{label}</option>}*/}
                {/*      </Message>*/}
                {/*      <Message id="sura">*/}
                {/*        {(label) => <option value={3}>{label}</option>}*/}
                {/*      </Message>*/}
                {/*      <Message id="part">*/}
                {/*        {(label) => <option value={4}>{label}</option>}*/}
                {/*      </Message>*/}
                {/*    </select>*/}
                {/*  </label>*/}
                {/*</div>*/}
                <RecitersGrid />
            </div>
        </>
    );
};

export default Settings;
