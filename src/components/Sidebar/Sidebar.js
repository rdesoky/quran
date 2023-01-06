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
import { PlayerButtons } from "../AudioPlayer/PlayerButtons";
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
            style={{
                pointerEvents: isShowMenu ? "fill" : "none",
                zIndex: menuExpanded ? 4 : 2,
            }}
            onClick={(e) => {
                //hide menu upon clicking outside of it
                if (menuExpanded) {
                    dispatch(hideMenu());
                }
            }}
        >
            <div
                className={"Sidebar"
                    .appendWord("narrow", isNarrow)
                    .appendWord("expanded", isShowMenu)
                    .appendWord("HiddenScroller", !isShowMenu)}
            >
                <div id="SidebarButtons">
                    <div className="SidebarSection">
                        <PlayerButtons
                            trigger="side_bar"
                            showLabels={isShowMenu}
                            showReciter={true}
                        />
                    </div>
                    {recentCommands
                        .filter((c) => c != null)
                        .map((command, index) => (
                            <CommandButton
                                command={command}
                                trigger="side_bar"
                                key={command}
                                showLabel={isShowMenu}
                            />
                        ))}
                </div>
            </div>
            <div
                style={{
                    position: "absolute",
                    left: 0,
                    bottom: 0,
                    height: 50,
                    backgroundColor: "#111",
                }}
            >
                <CommandButton
                    id="SideMenuExpander"
                    command="Commands"
                    trigger="side_bar"
                    updateChecker={true}
                    style={{ height: 50 }}
                />
            </div>
        </div>
    );
}

export default Sidebar;
