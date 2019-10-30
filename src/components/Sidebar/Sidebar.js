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
import { PlayerButtons } from "../AudioPlayer/AudioPlayer";

function Sidebar({ app, player, themeContext }) {
    useEffect(() => {
        if (recentDiv) {
            recentDiv.scrollTop = 0;
        }
    }, [app.recentCommands]);
    let recentDiv = null;
    return (
        <div
            id="SidebarBlocker"
            style={{ pointerEvents: app.expandedMenu ? "fill" : "none" }}
            onClick={e => {
                app.setExpandedMenu(false);
            }}
        >
            <CommandButton
                command="Commands"
                style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    height: 50
                }}
            />
            <div
                className={"Sidebar".appendWord("narrow", app.isNarrow)}
                style={{
                    width: app.expandedMenu
                        ? 220
                        : app.showMenu || !app.isNarrow
                        ? 50
                        : 0
                }}
            >
                <div
                    className="ButtonsList"
                    style={{
                        display:
                            app.showMenu || app.expandedMenu || !app.isNarrow
                                ? "flex"
                                : "none",
                        direction: "ltr"
                    }}
                >
                    <div id="SidebarPlayer" className="SidebarSection">
                        <PlayerButtons
                            showLabels={app.expandedMenu}
                            showReciter={false}
                        />
                    </div>
                    <div
                        id="RecentCommands"
                        ref={ref => {
                            recentDiv = ref;
                        }}
                        className="SidebarSection HiddenScroller"
                    >
                        <div style={{ height: app.recentCommands.length * 50 }}>
                            {app.recentCommands
                                .filter(c => c != null)
                                .map((command, index) => {
                                    return (
                                        <CommandButton
                                            command={command}
                                            key={command}
                                            style={{
                                                top: index * 50
                                            }}
                                            showLabel={app.expandedMenu}
                                        />
                                    );
                                })}
                        </div>
                    </div>
                    <div id="SidebarFooter" className="SidebarSection">
                        <CommandButton
                            command="Profile"
                            showLabel={app.expandedMenu}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ThemeConsumer(AppConsumer(PlayerConsumer(Sidebar)));
