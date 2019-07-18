import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import { withAppContext } from "../../context/App";
import { withThemeContext } from "../../context/Theme";
import { FormattedMessage } from "react-intl";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faTh,
	faLocationArrow,
	faUserCircle,
	faSearch,
	faList,
	faPlayCircle,
	faHeart,
	faCog,
	faAdjust,
	faQuestion,
	faEyeSlash,
	faCopy,
	faShareAlt
} from "@fortawesome/free-solid-svg-icons";

export const CommandIcons = {
	Commands: faTh,
	Index: faList,
	Goto: faLocationArrow,
	Search: faSearch,
	Play: faPlayCircle,
	Settings: faCog,
	Profile: faUserCircle,
	Theme: faAdjust,
	Favorites: faHeart,
	Commands: faTh,
	Help: faQuestion,
	Mask: faEyeSlash,
	Copy: faCopy,
	Share: faShareAlt
};

const Commands = ({ open, appContext, themeContext }) => {
	const list = [
		"Index",
		"Search",
		"Mask",
		"Goto",
		"Play",
		"Copy",
		"Share",
		"Favorites",
		"Theme",
		"Profile",
		"Settings",
		"Help"
	];

	const runCommand = command => {
		switch (command) {
			case "Theme":
				themeContext.toggleTheme();
				break;
			case "Mask":
				appContext.setMaskStart();
				break;
			case "Copy":
				//Clipboard.writeText("Hello");
				break;
			case "Share":
				break;
			default:
				appContext.setPopup(command);
				return;
		}
		appContext.pushRecentCommand(command);
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
						<FontAwesomeIcon icon={CommandIcons[command]} />
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
