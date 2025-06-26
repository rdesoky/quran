import { analytics } from "@/services/analytics";
import { FormattedMessage as Message, useIntl } from "react-intl";

import { useAudio, useContextPopup, useMessageBox } from "@/RefsProvider";
import {
    commandKey,
    copy2Clipboard,
    keyValues,
    requestFullScreen,
    selectTopCommand,
} from "@/services/utils";
import {
    addBookmark,
    deleteBookmark,
    selectIsBookmarked,
    selectUser,
} from "@/store/dbSlice";
import {
    gotoAya,
    gotoPage,
    hideMask,
    selectEndSelection,
    selectMaskStart,
    selectSelectedRange,
    selectSelectedText,
    selectStartSelection,
    startMask,
} from "@/store/navSlice";
import {
    AudioState,
    selectAudioState,
    selectPlayingAya,
} from "@/store/playerSlice";
import { AudioRange, selectReciter } from "@/store/settingsSlice";
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
} from "@/store/uiSlice";
import { useDispatch, useSelector } from "react-redux";
import { ayaIdPage, verseLocation } from "@/services/qData";

import { useHistory } from "@/hooks/useHistory";
import { selectPagesCount } from "@/store/layoutSlice";
import { AddHifz } from "./AddHifz";
import { CommandIcon, CommandType } from "./CommandIcon";
import PlayPrompt from "./PlayPrompt";
import UpdateBadge from "./UpdateBadge";

type CommandButtonProps = {
    id?: string;
    command: CommandType;
    showLabel?: boolean;
    showHotKey?: boolean;
    style?: React.CSSProperties;
    className?: string;
    trigger?: string;
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    updateChecker?: boolean; // if true, will check for updates and show a badge if
};

export const CommandButton = ({
    id,
    command,
    showLabel,
    showHotKey = true,
    style,
    className,
    trigger,
    onClick,
    updateChecker = false,
}: CommandButtonProps) => {
    const audio = useAudio();
    const msgBox = useMessageBox();
    const contextPopup = useContextPopup();
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

    const toggleBookmark = () => {
        if (isBookmarked) {
            msgBox.push({
                title: <Message id="are_you_sure" />,
                content: <Message id="delete_bookmark" />,
                onYes: () => {
                    dispatch(deleteBookmark(selectStart));
                },
            });
        } else {
            dispatch(addBookmark(selectStart));
        }
    };

    //TODO: move to a hook for other components to use
    const runCommand = (command: string) => {
        selectTopCommand();
        switch (command) {
            case "Commands":
                dispatch(toggleMenu());
                return;
            case "Play":
                if (popup === "Exercise") {
                    const playStart = selectedRange.start;
                    analytics.logEvent("play_audio", {
                        ...verseLocation(playStart),
                        reciter,
                        trigger,
                    });
                    dispatch(gotoPage(history, ayaIdPage(playStart)));
                    audio.play(selectedRange.start, AudioRange.exercise);
                } else {
                    msgBox.set({
                        title: <Message id={"play"} values={keyValues("r")} />,
                        content: <PlayPrompt trigger={trigger} />,
                    });
                }
                break;
            case "Pause":
            case "Resume":
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
                break;
            case "AudioPlayer":
            case "Stop":
                // analytics.logEvent("stop_audio", {
                //     ...verseLocation(playingAya),
                //     reciter,
                //     trigger,
                // });
                // audio.stop(true);
                msgBox.set({
                    title: <Message id="play" values={keyValues("r")} />,
                    content: <PlayPrompt trigger={trigger} />,
                });
                break;
            case "Downloading":
                analytics.logEvent("retry_stuck_audio", {
                    ...verseLocation(playingAya),
                    reciter: reciter,
                });
                // audio.stop();
                // setTimeout(() => {
                audio.play(playingAya, false);
                // }, 500);
                return;
            case "ToggleButton":
                analytics.logEvent(
                    menuExpanded ? "collapse_menu" : "expand_menu",
                    { trigger }
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
                    title: <Message id="update_hifz" />,
                    content: <AddHifz />,
                });
                if (popup && pagesCount === 1) {
                    dispatch(closePopup());
                }
                break;
            case "Exercise":
                dispatch(startMask(history));
                dispatch(showPopup(command));
                break;
            case "Tafseer":
                dispatch(gotoAya(history));
            // eslint-disable-next-line no-fallthrough
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
            let label: React.ReactNode | string = (
                <Message
                    id={command.toLowerCase()}
                    values={showHotKey ? keyValues(commandKey(command)) : {}}
                />
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

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (updateChecker && updateAvailable) {
            dispatch(setUpdateAvailable(false));
            msgBox.push({
                title: <Message id="update_available_title" />,
                content: <Message id="update_available" />,
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
            className={"CommandButton".appendWord(className)}
            title={
                showLabel
                    ? ""
                    : intl.formatMessage(
                          {
                              id: command.toLowerCase(),
                          },
                          keyValues(commandKey(command))
                      )
            }
        >
            {updateChecker && updateAvailable && <UpdateBadge />}
            <CommandIcon {...{ command }} />
            {renderLabel()}
        </button>
    );
};
