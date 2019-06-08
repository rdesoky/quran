import React from "react";
import "./Sidebar.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faSearch,
	faPaperPlane,
	faPlay,
	faBookmark
} from "@fortawesome/free-solid-svg-icons";

function Sidebar(props) {
	return (
		<div className="Sidebar">
			<div>
				<FontAwesomeIcon icon={faSearch} />
			</div>
			<div>
				<FontAwesomeIcon icon={faPaperPlane} />
			</div>
			<div>
				<FontAwesomeIcon icon={faPlay} />
			</div>
			<div>
				<FontAwesomeIcon icon={faBookmark} />
			</div>
		</div>
	);
}

export default Sidebar;
