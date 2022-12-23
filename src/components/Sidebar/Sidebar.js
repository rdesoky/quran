import React, { useContext, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppContext } from "../../context/App";
import { selectTopCommand } from "../../services/utils";
import { selectIsNarrow } from "../../store/layoutSlice";
import { hideMenu, selectPopup, selectShowMenu } from "../../store/uiSlice";
import { PlayerButtons } from "../AudioPlayer/AudioPlayer";
import { CommandButton } from "./../Modal/Commands";
import "./Sidebar.scss";

function Sidebar() {
    const dispatch = useDispatch();
    const app = useContext(AppContext);
    const popup = useSelector(selectPopup);
    const isShowMenu = useSelector(selectShowMenu);
    const isNarrow = useSelector(selectIsNarrow);
    let recentDiv = null;

    useEffect(() => {
        if (recentDiv) {
            recentDiv.scrollTop = 0;
        }
    }, [app.recentCommands, recentDiv]);

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
                dispatch(hideMenu());
            }}
        >
            <CommandButton
                id="SideMenuExpander"
                command="Commands"
                trigger="side_bar"
                style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    height: 50,
                    backgroundColor: "#000",
                }}
            />
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
                        ref={(ref) => {
                            recentDiv = ref;
                        }}
                        className="SidebarSection HiddenScroller"
                    >
                        <div style={{ height: app.recentCommands.length * 50 }}>
                            {app.recentCommands
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
        </div>
    );
}

export default Sidebar;
