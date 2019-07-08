import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import { withAppContext } from "../../context/App";
import { withThemeContext } from "../../context/Theme";
import { FormattedMessage } from "react-intl";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faLocationArrow,
	faUserCircle,
	faSearch,
	faList,
	faPlayCircle,
	faHeart,
	faCog,
	faAdjust
} from "@fortawesome/free-solid-svg-icons";

const Commands = ({ open, appContext, themeContext }) => {
	const commandIcons = {
		Index: faList,
		Goto: faLocationArrow,
		Search: faSearch,
		Play: faPlayCircle,
		Settings: faCog,
		Profile: faUserCircle,
		Theme: faAdjust,
		Favorites: faHeart
	};
	const list = [
		"Index",
		"Search",
		"Goto",
		"Play",
		"Favorites",
		"Theme",
		"Profile",
		"Settings"
	];

	const runCommand = command => {
		switch (command) {
			case "Theme":
				themeContext.toggleTheme();
				break;
			default:
				appContext.setPopup(command);
				return;
		}
		appContext.setPopup(null);
	};

	return (
		<Modal open={open}>
			<div className="Title">
				<FormattedMessage id="commands" />
			</div>
			<div className="CommandsList">
				{list.map(command => (
					<button onClick={e => runCommand(command)}>
						<FontAwesomeIcon icon={commandIcons[command]} />
						<br />
						<span className="CommandLabel">
							<FormattedMessage id={command.toLowerCase()} />
						</span>
					</button>
				))}
			</div>
		</Modal>
	);
};

export default withThemeContext(withAppContext(Commands));
