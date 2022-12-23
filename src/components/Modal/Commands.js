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
import { analytics } from "./../../services/Analytics";

import {
    faBookmark as farBookmark,
    faKeyboard,
    faLightbulb as farLightbulb,
} from "@fortawesome/free-regular-svg-icons";

import { useDispatch, useSelector } from "react-redux";
import { AppRefs } from "../../RefsProvider";
import {
    copy2Clipboard,
    lesserOf,
    requestFullScreen,
    selectTopCommand,
} from "../../services/utils";
import {
    addBookmark,
    deleteBookmark,
    selectIsBookmarked,
    selectUser,
} from "../../store/dbSlice";
import { selectIsNarrow } from "../../store/layoutSlice";
import {
    selectEndSelection,
    selectMaskStart,
    selectSelectedText,
    selectStartSelection,
    showMask,
} from "../../store/navSlice";
import {
    AudioState,
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
import { PlayerButtons } from "../AudioPlayer/AudioPlayer";
import { VerseInfo } from "../Widgets";
import { verseLocation } from "./../../services/QData";

import { UserImage } from "./User";
import { AddHifz } from "../AddHifz";

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

const getIcon = (commandId, isBookmarked, showMenu, maskStart) => {
    switch (commandId) {
        case "Mask":
            return CommandIcons[maskStart === -1 ? "Mask" : "MaskOn"];
        case "ToggleButton":
            return showMenu ? faAngleDoubleUp : faAngleDoubleDown;
        case "Bookmarks":
        case "Bookmark":
            return isBookmarked ? faBookmark : farBookmark;
        default:
            return CommandIcons[commandId];
    }
};

const CommandIcon = ({ command }) => {
    const showMenu = useSelector(selectShowMenu);
    const maskStart = useSelector(selectMaskStart);
    const reciter = useSelector(selectReciter);
    const audioState = useSelector(selectAudioState);
    const selectStart = useSelector(selectStartSelection);
    const isBookmarked = useSelector(selectIsBookmarked(selectStart));

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
                    <Icon
                        icon={getIcon(
                            command,
                            isBookmarked,
                            showMenu,
                            maskStart
                        )}
                    />
                </span>
            );
    }
};

const Commands = () => {
    const isNarrow = useSelector(selectIsNarrow);

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
    const audio = useContext(AppRefs).get("audio");
    const msgBox = useContext(AppRefs).get("msgBox");
    const dispatch = useDispatch();
    const menuExpanded = useSelector(selectShowMenu);
    const intl = useIntl();
    const selectStart = useSelector(selectStartSelection);
    const selectEnd = useSelector(selectEndSelection);
    const maskStart = useSelector(selectMaskStart);
    const reciter = useSelector(selectReciter);
    const playingAya = useSelector(selectPlayingAya);
    const audioState = useSelector(selectAudioState);
    const selectedText = useSelector(selectSelectedText);
    const isBookmarked = useSelector(selectIsBookmarked(selectStart));
    const user = useSelector(selectUser);

    const toggleBookmark = (e) => {
        if (isBookmarked) {
            msgBox.push({
                title: <String id="are_you_sure" />,
                content: <String id="delete_bookmark" />,
                onYes: () => {
                    dispatch(deleteBookmark(selectStart));
                },
            });
        } else {
            dispatch(addBookmark(selectStart));
        }
    };

    const runCommand = (command) => {
        selectTopCommand();
        switch (command) {
            case "Commands":
                dispatch(toggleMenu());
                return;
            case "Play":
                //TODO: first navigate to the current selection
                analytics.logEvent("play_audio", {
                    ...verseLocation(selectStart),
                    reciter,
                    trigger,
                });
                // dispatch(gotoAya(history, selectStart));
                audio.play(lesserOf(selectStart, selectEnd));
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
                    audio.resume();
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
                dispatch(showMask());
                break;
            case "Copy":
                analytics.logEvent("copy_text", {
                    ...verseLocation(selectStart),
                    verses_count: selectEnd - selectStart + 1,
                    trigger,
                });
                copy2Clipboard(selectedText);
                dispatch(showToast("text_copied"));
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
                toggleBookmark();
                return;
            case "Favorites":
            case "update_hifz":
                analytics.logEvent("show_update_hifz", {
                    ...verseLocation(selectStart),
                    trigger,
                });
                msgBox.set({
                    title: <String id="update_hifz" />,
                    content: <AddHifz />,
                });
                break;
            default: //already calls pushRecentCommand()
                analytics.logEvent(`show_${command.toLowerCase()}`, {
                    trigger,
                });
                dispatch(showPopup(command));
                dispatch(hideMenu());
                return;
        }
        // app.pushRecentCommand(command);
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
                    if (user && !user.isAnonymous) {
                        label = user.email;
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
            <CommandIcon {...{ command }} />
            {renderLabel()}
        </button>
    );
};
export default Commands;
export { CommandIcon, CommandButton };
