import React, { useEffect, useState } from "react";
import "./Sidebar.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faUserCircle,
	faTh,
	faCog,
	faAngleDoubleDown,
	faAngleDoubleUp
} from "@fortawesome/free-solid-svg-icons";
import { withAppContext } from "../../context/App";
import { withThemeContext } from "../../context/Theme";
import { CommandIcons } from "./../Modal/Commands";

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
			default:
				appContext.setPopup(id);
		}
		appContext.setShowMenu(false);
		e.preventDefault();
	};

	const toggleTheme = e => {
		themeContext.toggleTheme();
		appContext.setShowMenu(false);
		appContext.pushRecentCommand("Theme");
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
				bottom: appContext.showMenu || !appContext.isNarrow ? 25 : "auto"
			}}
		>
			<button
				onClick={toggleButtons}
				style={{ display: appContext.isNarrow ? "block" : "none" }}
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
					<FontAwesomeIcon icon={faTh} />
				</button>
				<hr />
				{appContext.recentCommands.map(command => {
					return (
						<button
							key={command}
							onClick={e => onClick(e, command)}
							title={command}
						>
							<FontAwesomeIcon icon={CommandIcons[command]} />
						</button>
					);
				})}
			</div>
		</div>
	);
}

export default withThemeContext(withAppContext(Sidebar));
