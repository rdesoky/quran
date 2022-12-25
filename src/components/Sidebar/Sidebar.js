import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectTopCommand } from "../../services/utils";
import { selectIsNarrow } from "../../store/layoutSlice";
import {
    hideMenu,
    selectPopup,
    selectRecentCommands,
    selectMenuExpanded,
} from "../../store/uiSlice";
import { PlayerButtons } from "../AudioPlayer/AudioPlayer";
import { CommandButton } from "../CommandButton";
import "./Sidebar.scss";

function Sidebar() {
    const dispatch = useDispatch();
    const popup = useSelector(selectPopup);
    const isShowMenu = useSelector(selectMenuExpanded);
    const isNarrow = useSelector(selectIsNarrow);
    const recentCommands = useSelector(selectRecentCommands);
    const menuExpanded = useSelector(selectMenuExpanded);
    // let recentDiv = null;

    // useEffect(() => {
    //     if (recentDiv) {
    //         recentDiv.scrollTop = 0;
    //     }
    // }, [recentDiv]);

    useEffect(() => {
        if (popup === null) {
            selectTopCommand();
        }
    }, [popup]);

    return (
        <div
            id="SidebarBlocker"
            style={{ pointerEvents: isShowMenu ? "fill" : "none" }}
            onClick={(e) => {
                // app.setExpandedMenu(false);
                if (menuExpanded) {
                    dispatch(hideMenu());
                }
            }}
        >
            <div
                className={"Sidebar".appendWord("narrow", isNarrow)}
                style={{
                    width: isShowMenu ? 220 : isShowMenu || !isNarrow ? 50 : 0,
                }}
            >
                <div
                    className="ButtonsList"
                    style={{
                        direction: "ltr",
                    }}
                >
                    <div id="SidebarPlayer" className="SidebarSection">
                        <PlayerButtons
                            trigger="side_bar"
                            showLabels={isShowMenu}
                            showReciter={true}
                        />
                    </div>
                    <div
                        id="RecentCommands"
                        className="SidebarSection HiddenScroller"
                    >
                        <div style={{ height: recentCommands.length * 50 }}>
                            {recentCommands
                                .filter((c) => c != null)
                                .map((command, index) => (
                                    <CommandButton
                                        command={command}
                                        trigger="side_bar"
                                        key={command}
                                        style={{
                                            top: index * 50,
                                        }}
                                        showLabel={isShowMenu}
                                    />
                                ))}
                        </div>
                    </div>
                    <div id="SidebarFooter" className="SidebarSection">
                        <CommandButton
                            command="Profile"
                            trigger="side_bar"
                            showLabel={isShowMenu}
                        />
                        <CommandButton
                            command="Settings"
                            trigger="side_bar"
                            showLabel={isShowMenu}
                        />
                    </div>
                </div>
            </div>
            <CommandButton
                id="SideMenuExpander"
                command="Commands"
                trigger="side_bar"
                style={{
                    position: "absolute",
                    left: 0,
                    bottom: 0,
                    height: 50,
                    backgroundColor: "#000",
                }}
            />
        </div>
    );
}

export default Sidebar;
