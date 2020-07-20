import React, { useState, useEffect, useContext } from "react";
import { analytics } from "./../../services/Analytics";
import { AppContext } from "../../context/App";
import { AudioState, PlayerContext } from "../../context/Player";
import { FormattedMessage as String } from "react-intl";
import { FontAwesomeIcon as Icon } from "@fortawesome/react-fontawesome";
import {
    faMask,
    faUserCircle,
    faSearch,
    faPlayCircle,
    faHeart,
    faCog,
    faAdjust,
    faQuestion,
    faCopy,
    faShareAlt,
    faQuran,
    faExpand,
    faBookmark,
    faAngleDoubleDown,
    faAngleDoubleUp,
    faFileDownload,
    faStopCircle,
    faPauseCircle,
    faBars,
    faListAlt,
    faPenNib,
    faPen,
    faBookOpen,
} from "@fortawesome/free-solid-svg-icons";

import {
    faBookmark as farBookmark,
    faKeyboard,
} from "@fortawesome/free-regular-svg-icons";

import Utils from "../../services/utils";
import { PlayerButtons } from "../AudioPlayer/AudioPlayer";
import { VerseInfo } from "../Widgets";
import { UserImage } from "./User";
import { AddHifz } from "./Favorites";
import QData from "./../../services/QData";

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
    Mask: faMask,
    MaskOn: faMask,
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

const getIcon = (commandId, app) => {
    switch (commandId) {
        case "Mask":
            return CommandIcons[app.maskStart === -1 ? "Mask" : "MaskOn"];
        case "ToggleButton":
            return app.showMenu ? faAngleDoubleUp : faAngleDoubleDown;
        case "Bookmarks":
        case "Bookmark":
            return app.isBookmarked() ? faBookmark : farBookmark;
        default:
            return CommandIcons[commandId];
    }
};

const commandIcon = (command, app, player) => {
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
                    src={`${process.env.PUBLIC_URL}/images/${player.reciter}.jpg`}
                    className={"ReciterIcon".appendWord(
                        "blinking",
                        player.audioState === AudioState.playing
                    )}
                />
                // </span>
            );

        default:
            return (
                <span>
                    <Icon icon={getIcon(command, app)} />
                </span>
            );
    }
};

const Commands = () => {
    const app = useContext(AppContext);

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
                {app.isNarrow ? (
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
    const player = useContext(PlayerContext);
    const runCommand = (command) => {
        app.setExpandedMenu(false);
        Utils.selectTopCommand();
        switch (command) {
            case "Commands":
                app.setExpandedMenu(!app.expandedMenu);
                break;
            case "Play":
                //TODO: first navigate to the current selection
                analytics.logEvent("play_audio", {
                    ...QData.verseLocation(app.selectStart),
                    reciter: player.reciter,
                    trigger,
                });
                app.gotoAya(app.selectStart);
                player.play();
                return;
            case "Pause":
                analytics.logEvent("pause_audio", {
                    ...QData.verseLocation(player.playingAya),
                    reciter: player.reciter,
                    trigger,
                });
                if (player.audioState === AudioState.playing) {
                    player.pause();
                } else {
                    player.resume();
                }
                return;
            case "Stop":
                analytics.logEvent("stop_audio", {
                    ...QData.verseLocation(player.playingAya),
                    reciter: player.reciter,
                    trigger,
                });
                player.stop(true);
                return;
            case "Downloading":
                analytics.logEvent("retry_stuck_audio", {
                    ...QData.verseLocation(player.playingAya),
                    reciter: player.reciter,
                });
                player.stop();
                setTimeout(() => {
                    player.play();
                }, 500);
                return;
            case "ToggleButton":
                analytics.logEvent(
                    app.showMenu ? "collapse_menu" : "expand_menu",
                    trigger
                );
                app.toggleShowMenu();
                return;
            case "Mask":
                analytics.logEvent(
                    app.maskStart === -1 ? "show_mask" : "hide_mask",
                    {
                        ...QData.verseLocation(app.selectStart),
                        trigger,
                    }
                );
                app.setMaskStart();
                break;
            case "Copy":
                analytics.logEvent("copy_text", {
                    ...QData.verseLocation(app.selectStart),
                    verses_count: app.selectEnd - app.selectStart + 1,
                    trigger,
                });
                Utils.copy2Clipboard(app.getSelectedText());
                app.showToast(app.intl.formatMessage({ id: "text_copied" }));
                break;
            case "Share":
                break;
            case "Fullscreen":
                Utils.requestFullScreen();
                break;
            case "Bookmark":
                analytics.logEvent("bookmark", {
                    ...QData.verseLocation(app.selectStart),
                    trigger,
                });
                app.toggleBookmark();
                return;
            case "Favorites":
            case "update_hifz":
                analytics.logEvent("show_update_hifz", {
                    ...QData.verseLocation(app.selectStart),
                    trigger,
                });
                app.setMessageBox({
                    title: <String id="update_hifz" />,
                    content: <AddHifz />,
                });
                break;
            // case "Bookmarks":
            //     if (app.popup === "Exercise") {
            //         app.toggleBookmark();
            //         break;
            //     }
            default:
                analytics.logEvent(`show_${command.toLowerCase()}`, {
                    trigger,
                });
                app.setPopup(command); //already calls pushRecentCommand()
                return;
        }
        app.pushRecentCommand(command);
        // if (app.pagesCount == 1) {
        //     app.closePopup();
        // }
        app.setShowMenu(false);
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
                }
            }}
            style={style}
            disabled={isDisabled(command)}
            className={"CommandButton".appendWord(className)}
            title={
                showLabel
                    ? ""
                    : app.formatMessage({ id: command.toLowerCase() })
            }
        >
            {commandIcon(command, app, player)}
            {renderLabel()}
        </button>
    );
};
export default Commands;
export { commandIcon, CommandButton };
