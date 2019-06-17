import React from "react";
import "./Sidebar.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faSearch,
	faTh as faPaperPlane,
	faPlayCircle,
	faFile as faBookmark,
	faHeart,
	faCog
} from "@fortawesome/free-solid-svg-icons";

function Sidebar(props) {
	const onClick = (e, id) => {
		if (props.onCommand) {
			props.onCommand(id);
		}
		e.preventDefault();
	};

	return (
		<div className="Sidebar">
			<a href="#" onClick={e => onClick(e, "Search")}>
				<FontAwesomeIcon icon={faSearch} />
			</a>
			<a href="#" onClick={e => onClick(e, "Goto")}>
				<FontAwesomeIcon icon={faPaperPlane} />
			</a>
			<a href="#" onClick={e => onClick(e, "Play")}>
				<FontAwesomeIcon icon={faPlayCircle} />
			</a>
			<a href="#" onClick={e => onClick(e, "Bookmark")}>
				<FontAwesomeIcon icon={faBookmark} />
			</a>
			<a href="#" onClick={e => onClick(e, "Heart")}>
				<FontAwesomeIcon icon={faCog} />
			</a>
		</div>
	);
}

export default Sidebar;
