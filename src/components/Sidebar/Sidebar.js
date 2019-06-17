import React from "react";
import "./Sidebar.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faUserCircle,
	faSearch,
	faTh,
	faPlayCircle,
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
			<button onClick={e => onClick(e, "User")}>
				<FontAwesomeIcon icon={faUserCircle} />
			</button>
			<button onClick={e => onClick(e, "QIndex")}>
				<FontAwesomeIcon icon={faTh} />
			</button>
			<button onClick={e => onClick(e, "Find")}>
				<FontAwesomeIcon icon={faSearch} />
			</button>
			<button onClick={e => onClick(e, "Play")}>
				<FontAwesomeIcon icon={faPlayCircle} />
			</button>
			<button onClick={e => onClick(e, "Bookmark")}>
				<FontAwesomeIcon icon={faHeart} />
			</button>
			<button onClick={e => onClick(e, "Heart")}>
				<FontAwesomeIcon icon={faCog} />
			</button>
		</div>
	);
}

export default Sidebar;
