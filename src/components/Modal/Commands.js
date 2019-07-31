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
	faShareAlt,
	faBook,
	faQuran,
	faAtlas,
	faRunning,
	faExpand
} from "@fortawesome/free-solid-svg-icons";
import Utils from "../../services/utils";

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
	Help: faQuestion,
	Mask: faEyeSlash,
	Copy: faCopy,
	Share: faShareAlt,
	Tafseer: faQuran,
	Exercise: faRunning,
	Fullscreen: faExpand
};

const Commands = ({ open, appContext, themeContext }) => {
	const list = [
		"Index",
		"Search",
		"Mask",
		"Goto",
		"Play",
		"Tafseer",
		"Copy",
		"Share",
		"Favorites",
		"Theme",
		"Profile",
		"Exercise",
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
				Utils.copy2Clipboard(appContext.getSelectedText());
				break;
			case "Share":
				break;
			case "Fullscreen":
				Utils.requestFullScreen();
				break;
			case "Play":
				appContext.showPlayer();
				return;
			default:
				appContext.setPopup(command);
				return;
		}
		appContext.pushRecentCommand(command);
		appContext.closePopup();
	};

	return (
		<>
			<div className="Title">
				<FormattedMessage id="commands" />
			</div>
			<div className="CommandsList">
				{list.map(command => (
					<button key={command} onClick={e => runCommand(command)}>
						<FontAwesomeIcon icon={CommandIcons[command]} />
						<br />
						<span className="CommandLabel">
							<FormattedMessage id={command.toLowerCase()} />
						</span>
					</button>
				))}
			</div>
		</>
	);
};

export default withThemeContext(withAppContext(Commands));
