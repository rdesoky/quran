import React, { useEffect, useContext } from "react";
import "./Sidebar.scss";
import { AppContext } from "../../context/App";
import { CommandButton } from "./../Modal/Commands";
import { PlayerButtons } from "../AudioPlayer/AudioPlayer";
import Utils from "../../services/utils";

function Sidebar() {
    const app = useContext(AppContext);
    useEffect(() => {
        if (recentDiv) {
            recentDiv.scrollTop = 0;
        }
    }, [app.recentCommands]);

    useEffect(() => {
        if (app.popup === null) {
            Utils.selectTopCommand();
        }
    }, [app.popup]);

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
                id="SideMenuExpander"
                command="Commands"
                style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    height: 50,
                    backgroundColor: "#000"
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
                                .map((command, index) => (
                                    <CommandButton
                                        command={command}
                                        key={command}
                                        style={{
                                            top: index * 50
                                        }}
                                        showLabel={app.expandedMenu}
                                    />
                                ))}
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

export default Sidebar;
