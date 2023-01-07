import React, { useContext } from "react";
import {
    FormattedMessage,
    FormattedMessage as String,
    useIntl,
} from "react-intl";
import { analytics } from "./../services/Analytics";

import { useDispatch, useSelector } from "react-redux";
import { AppRefs } from "../RefsProvider";
import {
    copy2Clipboard,
    requestFullScreen,
    selectTopCommand,
} from "../services/utils";
import {
    addBookmark,
    deleteBookmark,
    selectIsBookmarked,
    selectUser,
} from "../store/dbSlice";
import {
    gotoPage,
    hideMask,
    selectEndSelection,
    selectMaskStart,
    selectSelectedRange,
    selectSelectedText,
    selectStartSelection,
    startMask,
} from "../store/navSlice";
import {
    AudioState,
    selectAudioState,
    selectPlayingAya,
} from "../store/playerSlice";
import { selectReciter } from "../store/settingsSlice";
import {
    closePopup,
    hideMenu,
    selectMenuExpanded,
    selectPopup,
    selectUpdateAvailable,
    setUpdateAvailable,
    showPopup,
    showToast,
    toggleMenu,
} from "../store/uiSlice";
import { ayaIdPage, verseLocation } from "./../services/QData";

import { useHistory } from "react-router-dom";
import { selectPagesCount } from "../store/layoutSlice";
import { AddHifz } from "./AddHifz";
import { CommandIcon } from "./CommandIcon";
import UpdateBadge from "./UpdateBadge";

export const CommandButton = ({
    id,
    command,
    showLabel,
    style,
    className,
    trigger,
    onClick,
    playAya,
    audioRepeat = true,
    updateChecker = false,
}) => {
    const audio = useContext(AppRefs).get("audio");
    const msgBox = useContext(AppRefs).get("msgBox");
    const contextPopup = useContext(AppRefs).get("contextPopup");
    const dispatch = useDispatch();
    const menuExpanded = useSelector(selectMenuExpanded);
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
    const history = useHistory();
    const pagesCount = useSelector(selectPagesCount);
    const popup = useSelector(selectPopup);
    const selectedRange = useSelector(selectSelectedRange);
    const updateAvailable = useSelector(selectUpdateAvailable);

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

    //TODO: move to a hook for other components to use
    const runCommand = (command) => {
        selectTopCommand();
        switch (command) {
            case "Commands":
                dispatch(toggleMenu());
                return;
            case "Play":
                analytics.logEvent("play_audio", {
                    ...verseLocation(selectStart),
                    reciter,
                    trigger,
                });
                const playStart = playAya ? playAya : selectedRange.start;
                dispatch(gotoPage(history, ayaIdPage(playStart)));
                audio.play(playStart, audioRepeat);
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
                dispatch(maskStart === -1 ? startMask(history) : hideMask());
                if (popup && pagesCount === 1) {
                    dispatch(closePopup());
                }
                break;
            case "Copy":
                analytics.logEvent("copy_text", {
                    ...verseLocation(selectStart),
                    verses_count: selectEnd - selectStart + 1,
                    trigger,
                });
                copy2Clipboard(selectedText);
                dispatch(showToast({ id: "text_copied" }));
                break;
            case "Share":
                analytics.logEvent("share", { trigger });
                navigator.share?.({
                    url: window.location.origin,
                    title: intl.formatMessage({ id: "app_share_title" }),
                    text: intl.formatMessage({ id: "app_share_message" }),
                });
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
                if (popup && pagesCount === 1) {
                    dispatch(closePopup());
                }
                break;
            default: //already calls pushRecentCommand()
                analytics.logEvent(`show_${command.toLowerCase()}`, {
                    trigger,
                });
                dispatch(showPopup(command));
        }
        // app.pushRecentCommand(command);

        if (menuExpanded) {
            dispatch(hideMenu());
        }
        if (contextPopup.info) {
            contextPopup.close();
        }
    };

    const renderLabel = () => {
        if (showLabel === true) {
            let label = (
                <String className="CommandLabel" id={command.toLowerCase()} />
            );
            switch (command) {
                case "Profile":
                    if (user && !user.isAnonymous) {
                        label = user.displayName + " (u)";
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

    const handleClick = (e) => {
        if (updateChecker && updateAvailable) {
            dispatch(setUpdateAvailable(false));
            msgBox.push({
                title: <FormattedMessage id="update_available_title" />,
                content: <FormattedMessage id="update_available" />,
                onYes: () => {
                    document.location.reload();
                },
            });
            e.stopPropagation();
            return;
        }
        if (onClick) {
            onClick(e);
        } else {
            runCommand(command);
        }
        switch (command) {
            case "Commands":
            case "Stop":
                e.stopPropagation();
                break;
            default:
                break;
        }
    };

    return (
        <button
            id={id}
            onClick={handleClick}
            style={style}
            disabled={isDisabled(command)}
            className={"CommandButton".appendWord(className)}
            title={
                showLabel
                    ? ""
                    : intl.formatMessage({ id: command.toLowerCase() })
            }
        >
            {updateChecker && updateAvailable && <UpdateBadge />}
            <CommandIcon {...{ command }} />
            {renderLabel()}
        </button>
    );
};
