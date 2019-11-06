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
    faAngleDoubleUp,
    faFileDownload,
    faStopCircle,
    faPauseCircle,
    faBars,
    faListAlt,
    faPencilAlt,
    faPenFancy,
    faPenNib,
    faPenSquare,
    faEdit,
    faPencilRuler,
    faBookOpen
} from "@fortawesome/free-solid-svg-icons";
import Utils from "../../services/utils";
import { PlayerButtons, PlayerStatus } from "../AudioPlayer/AudioPlayer";
import { VerseInfo } from "../Widgets";

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
            return app.isBookmarked() ? faBookmark : faBookmark;
        default:
            return CommandIcons[commandId];
    }
};

const commandIcon = (command, app, player) => {
    switch (command) {
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
                <img
                    src={`${process.env.PUBLIC_URL}/images/${player.reciter}.jpg`}
                    className={"ReciterIcon".appendWord(
                        "blinking",
                        player.audioState === AudioState.playing
                    )}
                />
            );

        default:
            return <Icon icon={getIcon(command, app)} />;
    }
};

const Commands = ({ app }) => {
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

const CommandButton = ThemeConsumer(
    AppConsumer(
        PlayerConsumer(
            ({
                id,
                app,
                player,
                command,
                themeContext,
                showLabel,
                style,
                className
            }) => {
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
                            break;
                        case "Share":
                            break;
                        case "Fullscreen":
                            Utils.requestFullScreen();
                            break;
                        default:
                            app.setPopup(command);
                            return;
                    }
                    app.pushRecentCommand(command);
                    if (app.pagesCount == 1) {
                        app.closePopup();
                    }
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
                            "Stop"
                        ].includes(command)
                    );
                };

                return (
                    <button
                        id={id}
                        onClick={e => {
                            runCommand(command);
                            e.stopPropagation();
                        }}
                        style={style}
                        disabled={isDisabled(command)}
                        className={"CommandButton".appendWord(className)}
                    >
                        {commandIcon(command, app, player)}
                        {renderLabel()}
                    </button>
                );
            }
        )
    )
);

export default AppConsumer(Commands);
export { commandIcon, CommandButton };
