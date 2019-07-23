import React, { useEffect, useState } from "react";
import "./Sidebar.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faTh,
	faAngleDoubleDown,
	faAngleDoubleUp
} from "@fortawesome/free-solid-svg-icons";
import { withAppContext } from "../../context/App";
import { withThemeContext } from "../../context/Theme";
import { CommandIcons } from "./../Modal/Commands";
import Utils from "../../services/utils";

function Sidebar({ appContext, themeContext }) {
	const onClick = (e, id) => {
		switch (id) {
			case "Theme":
				toggleTheme();
				appContext.setPopup(null);
				break;
			case "Mask":
				appContext.setMaskStart();
				appContext.setPopup(null);
				break;
			case "Copy":
				appContext.setPopup(null);
				break;
			case "Share":
				break;
			case "Fullscreen":
				Utils.requestFullScreen();
				return;
			case "Tafseer":
				appContext.selectAya();
			default:
				appContext.setPopup(id);
		}
		appContext.setShowMenu(false);
		appContext.pushRecentCommand(id);
		e.preventDefault();
	};

	const toggleTheme = e => {
		themeContext.toggleTheme();
		// appContext.setShowMenu(false);
		// appContext.pushRecentCommand("Theme");
	};

	// useEffect(() => {
	// 	updateShowButtons(!appContext.isNarrow);
	// }, [appContext.isNarrow]);

	const toggleButtons = () => {
		appContext.toggleShowMenu();
	};

	return (
		<div
			className="Sidebar"
			style={{
				bottom:
					appContext.showMenu || !appContext.isNarrow
						? appContext.isNarrow
							? 25
							: 0
						: "auto"
			}}
		>
			<button
				onClick={toggleButtons}
				//style={{ display: appContext.isNarrow ? "block" : "none" }}
				style={{ visibility: appContext.isNarrow ? "visible" : "hidden" }}
			>
				<FontAwesomeIcon
					icon={appContext.showMenu ? faAngleDoubleUp : faAngleDoubleDown}
				/>
			</button>
			<div
				className="ButtonsList"
				style={{
					display:
						appContext.showMenu || !appContext.isNarrow ? "block" : "none"
				}}
			>
				<button onClick={e => onClick(e, "Commands")}>
					<FontAwesomeIcon icon={CommandIcons["Commands"]} />
				</button>
				<button onClick={e => onClick(e, "Fullscreen")}>
					<FontAwesomeIcon icon={CommandIcons["Fullscreen"]} />
				</button>
				<div id="RecentCommands">
					{appContext.recentCommands.map(command => {
						return (
							<button
								key={command}
								onClick={e => onClick(e, command)}
								title={command}
								command={command}
							>
								<FontAwesomeIcon icon={CommandIcons[command]} />
							</button>
						);
					})}
				</div>
			</div>
		</div>
	);
}

export default withThemeContext(withAppContext(Sidebar));
