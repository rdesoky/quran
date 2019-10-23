import React, { useEffect, useState } from "react";
import "./Sidebar.scss";
import { FontAwesomeIcon as Icon } from "@fortawesome/react-fontawesome";
import {
    faFileDownload,
    faAngleDoubleDown,
    faAngleDoubleUp,
    faPlayCircle,
    faPauseCircle,
    faStopCircle
} from "@fortawesome/free-solid-svg-icons";
import { AppConsumer } from "../../context/App";
import { PlayerConsumer, AudioState, AudioRepeat } from "../../context/Player";
import { ThemeConsumer } from "../../context/Theme";
import { CommandButton } from "./../Modal/Commands";

function Sidebar({ app, player, themeContext }) {
    const toggleButtons = () => {
        app.toggleShowMenu();
    };

    const play = e => {
        if (player.repeat === AudioRepeat.verse && app.popup !== "Exercise") {
            player.setRepeat(AudioRepeat.noStop);
        }
        player.play();
        app.setShowMenu(false);
    };

    const stop = e => {
        player.stop(true);
        app.setShowMenu(false);
    };
    const retry = e => {
        player.stop();
        setTimeout(() => {
            player.play();
        }, 500);
        // app.setShowMenu(false);
    };
    const resume = e => {
        player.resume();
        app.setShowMenu(false);
    };
    const pause = e => {
        player.pause();
        // app.setShowMenu(false);
    };

    const renderPlayer = () => {
        let playButton = null,
            stopBtn = null;

        if (player.audioState !== AudioState.stopped) {
            stopBtn = (
                <button onClick={stop}>
                    <Icon icon={faStopCircle} />
                </button>
            );
        }

        switch (player.audioState) {
            case AudioState.paused:
                playButton = (
                    <button onClick={resume} className="blinking">
                        <Icon icon={faPauseCircle} />
                    </button>
                );
                break;
            case AudioState.playing:
                playButton = (
                    <button onClick={pause}>
                        <Icon icon={faPauseCircle} />
                    </button>
                );
                break;
            case AudioState.buffering:
                playButton = (
                    <button onClick={retry} className="blinking">
                        <Icon icon={faFileDownload} />
                    </button>
                );
                break;
            default:
                playButton = (
                    <button onClick={play}>
                        <Icon icon={faPlayCircle} />
                    </button>
                );
        }

        const reciterButton =
            player.audioState === AudioState.stopped ? (
                ""
            ) : (
                <CommandButton command="AudioPlayer" showLabel={false} />
            );

        return (
            <div id="SidebarAudioPlayer" className="SidebarSection">
                {reciterButton}
                {playButton} {stopBtn}
            </div>
        );
    };

    return (
        <div
            className={"Sidebar" + (app.isNarrow ? " narrow" : "")}
            style={{
                bottom: app.showMenu || !app.isNarrow ? 0 : "auto"
            }}
        >
            <CommandButton
                command="ToggleButton"
                showLabel={false}
                style={{ display: app.isNarrow ? "block" : "none", height: 50 }}
            />
            <div
                className="ButtonsList"
                style={{
                    display: app.showMenu || !app.isNarrow ? "flex" : "none"
                }}
            >
                <div>
                    <CommandButton command="Commands" showLabel={false} />
                </div>
                {renderPlayer()}
                <div id="RecentCommands" className="SidebarSection">
                    {app.recentCommands
                        .filter(c => c != null)
                        .map((command, index) => {
                            return (
                                <CommandButton
                                    command={command}
                                    key={command}
                                    showLabel={false}
                                    style={{
                                        top: index * 50
                                    }}
                                />
                            );
                        })}
                </div>
                <div id="SidebarFooter" className="SidebarSection">
                    <CommandButton command="Profile" showLabel={false} />
                </div>
            </div>
        </div>
    );
}

export default ThemeConsumer(AppConsumer(PlayerConsumer(Sidebar)));
