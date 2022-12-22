import {
    faAdjust,
    faAngleDoubleDown,
    faAngleDoubleUp,
    faBars,
    faBookmark,
    faBookOpen,
    faCog,
    faCopy,
    faExpand,
    faFileDownload,
    faHeart,
    faLightbulb,
    faListAlt,
    faPauseCircle,
    faPlayCircle,
    faQuestion,
    faQuran,
    faSearch,
    faShareAlt,
    faStopCircle,
    faUserCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon as Icon } from "@fortawesome/react-fontawesome";
import React, { useContext } from "react";
import { FormattedMessage as String, useIntl } from "react-intl";
import { AppContext } from "../../context/App";
import { AudioState } from "../../context/Player";
import { analytics } from "./../../services/Analytics";

import {
    faBookmark as farBookmark,
    faKeyboard,
    faLightbulb as farLightbulb,
} from "@fortawesome/free-regular-svg-icons";

import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import {
    copy2Clipboard,
    requestFullScreen,
    selectTopCommand,
} from "../../services/utils";
import { selectIsNarrow } from "../../store/layoutSlice";
import {
    gotoAya,
    selectEndSelection,
    selectMaskStart,
    selectSelectedText,
    selectStartSelection,
    setMaskStart,
} from "../../store/navSlice";
import {
    play,
    selectAudioState,
    selectPlayingAya,
} from "../../store/playerSlice";
import { selectReciter } from "../../store/settingsSlice";
import {
    hideMenu,
    selectShowMenu,
    showPopup,
    showToast,
    toggleMenu,
} from "../../store/uiSlice";
import { AudioContext } from "../Audio";
import { PlayerButtons } from "../AudioPlayer/AudioPlayer";
import { setMessageBox } from "../MessageBox";
import { VerseInfo } from "../Widgets";
import { verseLocation } from "./../../services/QData";
import { AddHifz } from "./Favorites";
import { UserImage } from "./User";

export const CommandIcons = {
    Commands: faBars,
    Index: faListAlt,
    Indices: faListAlt,
    Goto: faBookOpen,
    Search: faSearch,
    Play: faPlayCircle,
    AudioPlayer: faPlayCircle,
    Settings: faCog,
    Profile: faUserCircle,
    Theme: faAdjust,
    Favorites: faHeart,
    update_hifz: faHeart,
    Help: faQuestion,
    Mask: faLightbulb,
    MaskOn: farLightbulb,
    Copy: faCopy,
    Share: faShareAlt,
    Tafseer: faQuran,
    // Exercise: faPenNib,
    Exercise: faKeyboard,
    Fullscreen: faExpand,
    Bookmarks: faBookmark,
    ToggleButton: faAngleDoubleDown,
    Downloading: faFileDownload,
    Pause: faPauseCircle,
    Stop: faStopCircle,
};

const getIcon = (commandId, app, showMenu, maskStart) => {
    switch (commandId) {
        case "Mask":
            return CommandIcons[maskStart === -1 ? "Mask" : "MaskOn"];
        case "ToggleButton":
            return showMenu ? faAngleDoubleUp : faAngleDoubleDown;
        case "Bookmarks":
        case "Bookmark":
            return app.isBookmarked() ? faBookmark : farBookmark;
        default:
            return CommandIcons[commandId];
    }
};

const CommandIcon = ({ command, app }) => {
    const showMenu = useSelector(selectShowMenu);
    const maskStart = useSelector(selectMaskStart);
    const reciter = useSelector(selectReciter);
    const audioState = useSelector(selectAudioState);

    switch (command) {
        case "Profile":
            return <UserImage />;
        case "AudioPlayer":
            return (
                // <div
                //     className={"ReciterIcon".appendWord(
                //         "blinking",
                //         player.audioState === AudioState.playing
                //     )}
                //     style={{
                //         backgroundImage:
                //             "url(" +
                //             process.env.PUBLIC_URL +
                //             "/images/" +
                //             player.reciter +
                //             ".jpg)"
                //     }}
                // />
                // <span>
                <img
                    src={`${process.env.PUBLIC_URL}/images/${reciter}.jpg`}
                    className={"ReciterIcon".appendWord(
                        "blinking",
                        audioState === AudioState.playing
                    )}
                    alt="recite"
                />
                // </span>
            );

        default:
            return (
                <span>
                    <Icon icon={getIcon(command, app, showMenu, maskStart)} />
                </span>
            );
    }
};

const Commands = () => {
    // const app = useContext(AppContext);
    const isNarrow = useSelector(selectIsNarrow);
    const dispatch = useDispatch();

    const list = [
        "Index",
        "AudioPlayer",
        "Search",
        "Exercise",
        "Tafseer",
        "Mask",
        "Goto",
        "Theme",
        "Bookmarks",
        "Copy",
        "Share",
        "update_hifz",
        "Profile",
        "Settings",
        "Help",
        // "Fullscreen",
    ];

    return (
        <>
            <div className="Title">
                {isNarrow ? (
                    <>
                        <VerseInfo trigger="commands_title" />
                        <PlayerButtons
                            trigger="commands_title"
                            showReciter={false}
                        />
                    </>
                ) : (
                    <String id="commands" />
                )}
            </div>
            <div className="CommandsList">
                {list.map((command) => (
                    <CommandButton
                        key={command}
                        command={command}
                        showLabel={true}
                    />
                ))}
            </div>
        </>
    );
};

const CommandButton = ({
    id,
    command,
    showLabel,
    style,
    className,
    trigger,
}) => {
    const app = useContext(AppContext);
    const audio = useContext(AudioContext);
    const dispatch = useDispatch();
    const menuExpanded = useSelector(selectShowMenu);
    const intl = useIntl();
    const history = useHistory();
    const selectStart = useSelector(selectStartSelection);
    const selectEnd = useSelector(selectEndSelection);
    const maskStart = useSelector(selectMaskStart);
    const reciter = useSelector(selectReciter);
    const playingAya = useSelector(selectPlayingAya);
    const audioState = useSelector(selectAudioState);
    const selectedText = useSelector(selectSelectedText);

    const runCommand = (command) => {
        // app.setExpandedMenu(false);
        selectTopCommand();
        switch (command) {
            case "Commands":
                // app.setExpandedMenu(!app.expandedMenu);
                dispatch(toggleMenu());
                return;
            case "Play":
                //TODO: first navigate to the current selection
                analytics.logEvent("play_audio", {
                    ...verseLocation(selectStart),
                    reciter,
                    trigger,
                });
                // app.gotoAya(app.selectStart);
                dispatch(gotoAya(history, selectStart));
                dispatch(play(audio));
                // player.play();
                return;
            case "Pause":
                analytics.logEvent("pause_audio", {
                    ...verseLocation(playingAya),
                    reciter,
                    trigger,
                });
                if (audioState === AudioState.playing) {
                    audio.pause();
                } else {
                    audio.play();
                }
                return;
            case "Stop":
                analytics.logEvent("stop_audio", {
                    ...verseLocation(playingAya),
                    reciter,
                    trigger,
                });
                audio.stop(true);
                return;
            case "Downloading":
                analytics.logEvent("retry_stuck_audio", {
                    ...verseLocation(playingAya),
                    reciter: reciter,
                });
                audio.stop();
                setTimeout(() => {
                    audio.play();
                }, 500);
                return;
            case "ToggleButton":
                analytics.logEvent(
                    menuExpanded ? "collapse_menu" : "expand_menu",
                    trigger
                );
                // app.toggleShowMenu();
                dispatch(toggleMenu());
                return;
            case "Mask":
                analytics.logEvent(
                    maskStart === -1 ? "show_mask" : "hide_mask",
                    {
                        ...verseLocation(selectStart),
                        trigger,
                    }
                );
                // app.setMaskStart();
                dispatch(setMaskStart());
                break;
            case "Copy":
                analytics.logEvent("copy_text", {
                    ...verseLocation(selectStart),
                    verses_count: selectEnd - selectStart + 1,
                    trigger,
                });
                copy2Clipboard(selectedText);
                dispatch(showToast("text_copied"));
                // app.showToast(app.intl.formatMessage({ id: "text_copied" }));
                break;
            case "Share":
                break;
            case "Fullscreen":
                requestFullScreen();
                break;
            case "Bookmark":
                analytics.logEvent("bookmark", {
                    ...verseLocation(selectStart),
                    trigger,
                });
                switch (app.toggleBookmark()) {
                    case 1:
                        dispatch(showToast("bookmark_added"));
                        break;
                    case -1:
                        dispatch(showToast("bookmark_deleted"));
                        break;
                    default:
                        break;
                }
                return;
            case "Favorites":
            case "update_hifz":
                analytics.logEvent("show_update_hifz", {
                    ...verseLocation(selectStart),
                    trigger,
                });
                setMessageBox({
                    title: <String id="update_hifz" />,
                    content: <AddHifz />,
                });
                break;
            // case "Bookmarks":
            //     if (app.popup === "Exercise") {
            //         app.toggleBookmark();
            //         break;
            //     }
            default: //already calls pushRecentCommand()
                analytics.logEvent(`show_${command.toLowerCase()}`, {
                    trigger,
                });
                dispatch(showPopup(command));
                // app.setPopup(command);
                dispatch(hideMenu());
                return;
        }
        app.pushRecentCommand(command);
        // if (pagesCount == 1) {
        //     app.closePopup();
        // }
        // app.setShowMenu(false);
        dispatch(hideMenu());
    };

    const renderLabel = () => {
        if (showLabel === true) {
            let label = (
                <String className="CommandLabel" id={command.toLowerCase()} />
            );
            switch (command) {
                case "Profile":
                    if (app.user && !app.user.isAnonymous) {
                        label = app.user.email;
                    }
                    break;
                default:
                    break;
            }
            return <span className="CommandLabel">{label}</span>;
        }
    };

    const isDisabled = (command) => {
        return false;
        // return (
        //     app.popup === "Exercise" &&
        //     ![
        //         "Commands",
        //         "Play",
        //         "Pause",
        //         "Exercise",
        //         "Stop",
        //         "Bookmarks",
        //         "Copy"
        //     ].includes(command)
        // );
    };

    return (
        <button
            id={id}
            onClick={(e) => {
                runCommand(command);
                switch (command) {
                    case "Commands":
                        e.stopPropagation();
                        break;
                    default:
                        break;
                }
            }}
            style={style}
            disabled={isDisabled(command)}
            className={"CommandButton".appendWord(className)}
            title={
                showLabel
                    ? ""
                    : intl.formatMessage({ id: command.toLowerCase() })
            }
        >
            <CommandIcon {...{ command, app }} />
            {renderLabel()}
        </button>
    );
};
export default Commands;
export { CommandIcon, CommandButton };
