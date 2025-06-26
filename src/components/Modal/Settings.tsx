import { faLanguage } from "@fortawesome/free-solid-svg-icons";
import Icon from "@/components/Icon";
import React from "react";
import { FormattedMessage as Message } from "react-intl";
import { useDispatch, useSelector } from "react-redux";
import Switch from "react-switch";
import AudioSettings from "@/AudioSettings";
import useSnapHeightToBottomOf from "@/hooks/useSnapHeightToBottomOff";
import { analytics } from "@/services/analytics";
import { selectAppHeight, selectIsNarrow } from "@/store/layoutSlice";
import { selectPlayingAya } from "@/store/playerSlice";
import {
    selectLang,
    selectTheme,
    setLang,
    setTheme,
} from "@/store/settingsSlice";
import { selectPopup } from "@/store/uiSlice";
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

    const onUpdateTheme = (checked: boolean) => {
        const theme_name = checked ? "Dark" : "Default";
        dispatch(setTheme(theme_name));
        localStorage.setItem("theme", theme_name);
        analytics.logEvent("set_theme", { theme_name, trigger: popup });
    };

    const updateLang = ({
        currentTarget,
    }: React.ChangeEvent<HTMLSelectElement>) => {
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
                <AudioSettings />
                <hr />
                <RecitersGrid />
            </div>
        </>
    );
};

export default Settings;
