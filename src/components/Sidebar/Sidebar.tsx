import { PlayerButtons } from "@/components/AudioPlayer/PlayerButtons";
import { CommandButton } from "@/components/CommandButton";
import "@/components/Sidebar/Sidebar.scss";
import { useScrollMonitorRef } from "@/hooks/useScrollMonitorRef";
import { selectTopCommand } from "@/services/utils";
import { selectIsNarrow } from "@/store/layoutSlice";
import {
  hideMenu,
  selectMenuExpanded,
  selectPopup,
  selectRecentCommands,
} from "@/store/uiSlice";
import {
  faAngleDoubleDown,
  faAngleDoubleUp,
} from "@fortawesome/free-solid-svg-icons";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Icon from "../Icon";

function Sidebar() {
  const dispatch = useDispatch();
  const popup = useSelector(selectPopup);
  const isShowMenu = useSelector(selectMenuExpanded);
  const isNarrow = useSelector(selectIsNarrow);
  const recentCommands = useSelector(selectRecentCommands);
  const menuExpanded = useSelector(selectMenuExpanded);
  const {
    ref: sidebarRef,
    enableUp,
    enableDown,
    scrollDown,
    scrollUp,
  } = useScrollMonitorRef<HTMLDivElement>();

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
        zIndex: menuExpanded ? 4 : 3,
      }}
      onClick={(_e) => {
        //hide menu upon clicking outside of it
        if (menuExpanded) {
          dispatch(hideMenu());
        }
      }}
    >
      <div id="SidebarBorder" className={isNarrow ? "narrow" : ""}>
        {!isNarrow && enableUp && !menuExpanded && (
          <button
            id="SidebarUpBtn"
            className="sidebar-scroll-btn"
            onClick={() => scrollUp()}
          >
            <Icon icon={faAngleDoubleUp} />
          </button>
        )}
        <div
          id="Sidebar"
          ref={sidebarRef}
          className={"Sidebar SidebarSection"
            .appendWord("narrow", isNarrow)
            .appendWord("expanded", isShowMenu)
            .appendWord("HiddenScroller", !isShowMenu)}
          // style={{ bottom: isNarrow ? 25 : 50 }}
          // style={{ bottom: 50 }}
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
              .filter((c) => {
                return c !== null;
              })
              .map((command, _index) => (
                <CommandButton
                  command={command}
                  trigger="side_bar"
                  key={command}
                  className={popup === command ? "selected" : ""}
                  showLabel={isShowMenu}
                />
              ))}
          </div>
        </div>
        {!isNarrow && !enableDown && !menuExpanded && (
          <button
            id="SidebarDownBtn"
            className="sidebar-scroll-btn"
            onClick={() => scrollDown()}
          >
            <Icon icon={faAngleDoubleDown} />
          </button>
        )}
        <div
          style={{
            position: "absolute",
            left: 0,
            bottom: 0,
            // height: isNarrow ? 25 : 50,
          }}
        >
          {/* {showZoom && <CommandButton
						id="SideMenuExpander"
						command="Zoom"
						trigger="side_bar"
						updateChecker={true}
						style={{ height: 50 }}
					/>} */}

          <CommandButton
            id="SideMenuExpander"
            command="Commands"
            trigger="side_bar"
            updateChecker={true}
            // style={{ height: isNarrow ? 25 : 50 }}
          />
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
