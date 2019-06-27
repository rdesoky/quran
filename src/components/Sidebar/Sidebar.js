import React, { useEffect, useState } from "react";
import "./Sidebar.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faUserCircle,
	faSearch,
	faTh,
	faPlayCircle,
	faHeart,
	faCog,
	faAngleDoubleDown,
	faAngleDoubleUp
} from "@fortawesome/free-solid-svg-icons";
import { withAppContext } from "../../context/App";
import { withThemeContext } from "../../context/Theme";

function Sidebar({ appContext, themeContext }) {
	const onClick = (e, id) => {
		appContext.setPopup(id);
		//if (appContext.isNarrow) {
		appContext.setShowMenu(false);
		//}
		e.preventDefault();
	};

	const toggleTheme = e => {
		themeContext.toggleTheme();
		appContext.setShowMenu(false);
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
				bottom: appContext.showMenu || !appContext.isNarrow ? 0 : "auto"
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
				<button onClick={e => onClick(e, "QIndex")}>
					<FontAwesomeIcon icon={faTh} />
				</button>
				<button onClick={e => onClick(e, "Find")}>
					<FontAwesomeIcon icon={faSearch} />
				</button>
				<button onClick={e => onClick(e, "Play")}>
					<FontAwesomeIcon icon={faPlayCircle} />
				</button>
				<button onClick={toggleTheme}>
					<FontAwesomeIcon icon={faHeart} />
				</button>
				<hr />
				<button onClick={e => onClick(e, "User")}>
					<FontAwesomeIcon icon={faUserCircle} />
				</button>
				<button onClick={e => onClick(e, "Settings")}>
					<FontAwesomeIcon icon={faCog} />
				</button>
			</div>
		</div>
	);
}

export default withThemeContext(withAppContext(Sidebar));
