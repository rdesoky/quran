import React, { useState, useEffect } from "react";
import { AppConsumer } from "../../context/App";
import { PlayerConsumer, AudioState } from "../../context/Player";
import { ThemeConsumer } from "../../context/Theme";
import { FormattedMessage as String } from "react-intl";
import { FontAwesomeIcon as Icon } from "@fortawesome/react-fontawesome";
import {
    faTh,
    faLocationArrow,
    faUserCircle,
    faSearch,
    faList,
    faPlayCircle,
    faHeart,
    faCog,
    faAdjust,
    faQuestion,
    faEyeSlash,
    faCopy,
    faShareAlt,
    faBook,
    faQuran,
    faAtlas,
    faRunning,
    faExpand,
    faBookmark,
    faEye,
    faAngleDoubleDown,
    faAngleDoubleUp
} from "@fortawesome/free-solid-svg-icons";
import Utils from "../../services/utils";

export const CommandIcons = {
    Commands: faTh,
    Index: faList,
    Goto: faLocationArrow,
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
    Exercise: faRunning,
    Fullscreen: faExpand,
    Bookmarks: faBookmark,
    ToggleButton: faAngleDoubleDown
};

const getIcon = (commandId, app) => {
    switch (commandId) {
        case "Mask":
            return CommandIcons[app.maskStart === -1 ? "Mask" : "MaskOn"];
        case "ToggleButton":
            return app.showMenu ? faAngleDoubleUp : faAngleDoubleDown;
        default:
            return CommandIcons[commandId];
    }
};

const commandIcon = (command, app, player) => {
    switch (command) {
        case "AudioPlayer":
            return (
                <div
                    className={
                        "ReciterIcon" +
                        (player.audioState === AudioState.playing
                            ? " blinking"
                            : "")
                    }
                    style={{
                        backgroundImage:
                            "url(" +
                            process.env.PUBLIC_URL +
                            "/images/" +
                            player.reciter +
                            ".jpg)"
                    }}
                />
            );

        default:
            return <Icon icon={getIcon(command, app)} />;
    }
};

const Commands = () => {
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
                <String id="commands" />
            </div>
            <div className="CommandsList">
                {list.map(command => (
                    <CommandButton key={command} command={command} />
                ))}
            </div>
        </>
    );
};

const CommandButton = ThemeConsumer(
    AppConsumer(
        PlayerConsumer(
            ({ app, player, command, themeContext, showLabel, style }) => {
                const runCommand = command => {
                    switch (command) {
                        case "ToggleButton":
                            app.toggleShowMenu();
                            return;
                        case "Theme":
                            themeContext.toggleTheme();
                            break;
                        case "Mask":
                            app.setMaskStart();
                            break;
                        case "Copy":
                            Utils.copy2Clipboard(app.getSelectedText());
                            break;
                        case "Share":
                            break;
                        case "Fullscreen":
                            Utils.requestFullScreen();
                            break;
                        // case "Bookmarks":
                        //     app.addBookmark();
                        //     break;
                        default:
                            app.setPopup(command);
                            return;
                    }
                    app.pushRecentCommand(command);
                    app.closePopup();
                    app.setShowMenu(false);
                };

                const renderLabel = () => {
                    if (showLabel !== false) {
                        return (
                            <>
                                <br />
                                <span className="CommandLabel">
                                    <String id={command.toLowerCase()} />
                                </span>
                            </>
                        );
                    }
                };

                return (
                    <button onClick={e => runCommand(command)} style={style}>
                        {commandIcon(command, app, player)}
                        {renderLabel()}
                    </button>
                );
            }
        )
    )
);

export default Commands;
export { commandIcon, CommandButton };
