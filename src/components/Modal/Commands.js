import React, { useState, useEffect, useContext } from "react";
import { AppConsumer, AppContext } from "../../context/App";
import {
    PlayerConsumer,
    AudioState,
    PlayerContext
} from "../../context/Player";
import { ThemeConsumer, ThemeContext } from "../../context/Theme";
import { FormattedMessage as String } from "react-intl";
import { FontAwesomeIcon as Icon } from "@fortawesome/react-fontawesome";
import {
    faUserCircle,
    faSearch,
    faPlayCircle,
    faHeart,
    faCog,
    faAdjust,
    faQuestion,
    faEyeSlash,
    faCopy,
    faShareAlt,
    faQuran,
    faExpand,
    faBookmark,
    faEye,
    faAngleDoubleDown,
    faAngleDoubleUp,
    faFileDownload,
    faStopCircle,
    faPauseCircle,
    faBars,
    faListAlt,
    faPenNib,
    faBookOpen
} from "@fortawesome/free-solid-svg-icons";

import { faBookmark as farBookmark } from "@fortawesome/free-regular-svg-icons";

import Utils from "../../services/utils";
import { PlayerButtons } from "../AudioPlayer/AudioPlayer";
import { VerseInfo } from "../Widgets";
import { UserImage } from "./User";

export const CommandIcons = {
    Commands: faBars,
    Index: faListAlt,
    Goto: faBookOpen,
    Search: faSearch,
    Play: faPlayCircle,
    AudioPlayer: faPlayCircle,
    Settings: faCog,
    Profile: faUserCircle,
    Theme: faAdjust,
    Favorites: faHeart,
    Help: faQuestion,
    Mask: faEyeSlash,
    MaskOn: faEye,
    Copy: faCopy,
    Share: faShareAlt,
    Tafseer: faQuran,
    Exercise: faPenNib,
    Fullscreen: faExpand,
    Bookmarks: faBookmark,
    ToggleButton: faAngleDoubleDown,
    Downloading: faFileDownload,
    Pause: faPauseCircle,
    Stop: faStopCircle
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
                <span>
                    <img
                        src={`${process.env.PUBLIC_URL}/images/${player.reciter}.jpg`}
                        className={"ReciterIcon".appendWord(
                            "blinking",
                            player.audioState === AudioState.playing
                        )}
                    />
                </span>
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
        "Favorites",
        "Profile",
        "Settings",
        "Help"
        // "Fullscreen",
    ];

    return (
        <>
            <div className="Title">
                {app.isNarrow ? (
                    <>
                        <VerseInfo />
                        <PlayerButtons showReciter={false} />
                    </>
                ) : (
                    <String id="commands" />
                )}
            </div>
            <div className="CommandsList">
                {list.map(command => (
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

const CommandButton = ({ id, command, showLabel, style, className }) => {
    const app = useContext(AppContext);
    const player = useContext(PlayerContext);
    const themeContext = useContext(ThemeContext);
    const runCommand = command => {
        app.setExpandedMenu(false);
        Utils.selectTopCommand();
        switch (command) {
            case "Commands":
                app.setExpandedMenu(!app.expandedMenu);
                break;
            case "Play":
                player.play();
                return;
            case "Pause":
                if (player.audioState === AudioState.playing) {
                    player.pause();
                } else {
                    player.resume();
                }
                return;
            case "Stop":
                player.stop(true);
                return;
            case "Downloading":
                player.stop();
                setTimeout(() => {
                    player.play();
                }, 500);
                return;
            case "ToggleButton":
                app.toggleShowMenu();
                return;
            case "Theme":
                themeContext.toggleTheme();
                app.pushRecentCommand(command);
                app.setShowMenu(false);
                return;
            case "Mask":
                app.setMaskStart();
                break;
            case "Copy":
                Utils.copy2Clipboard(app.getSelectedText());
                app.showToast(app.formatMessage({ id: "text_copied" }));
                break;
            case "Share":
                break;
            case "Fullscreen":
                Utils.requestFullScreen();
                break;
            case "Bookmark":
                app.toggleBookmark();
                return;
            case "Bookmarks":
                if (app.popup === "Exercise") {
                    app.toggleBookmark();
                    break;
                }
            default:
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
            return (
                <span className="CommandLabel">
                    <String
                        className="CommandLabel"
                        id={command.toLowerCase()}
                    />
                </span>
            );
        }
    };

    const isDisabled = command => {
        return (
            app.popup === "Exercise" &&
            ![
                "Commands",
                "Play",
                "Pause",
                "Exercise",
                "Stop",
                "Bookmarks",
                "Copy"
            ].includes(command)
        );
    };

    return (
        <button
            id={id}
            onClick={e => {
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
        >
            {commandIcon(command, app, player)}
            {renderLabel()}
        </button>
    );
};
export default AppConsumer(Commands);
export { commandIcon, CommandButton };
