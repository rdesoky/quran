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
    return (
        <div
            className={"Sidebar" + (app.isNarrow ? " narrow" : "")}
            style={{
                bottom: app.showMenu || !app.isNarrow ? 0 : "auto"
            }}
        >
            {/* <CommandButton
                command="ToggleButton"
                style={{ display: app.isNarrow ? "block" : "none", height: 50 }}
            /> */}
            <CommandButton
                command="Commands"
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
                <PlayerButtons />
                <div id="RecentCommands" className="SidebarSection">
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
                                />
                            );
                        })}
                </div>
                <div id="SidebarFooter" className="SidebarSection">
                    <CommandButton command="Profile" />
                </div>
            </div>
        </div>
    );
}

export default ThemeConsumer(AppConsumer(PlayerConsumer(Sidebar)));
