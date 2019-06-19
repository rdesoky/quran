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
import { withAppContext } from "../../context/AppProvider";

function Sidebar({ onCommand, appContext }) {
	// const [wSize, updateSize] = useState({
	// 	width: window.innerWidth,
	// 	height: window.innerHeight
	// });

	const [showButtons, updateShowButtons] = useState(true);

	const onClick = (e, id) => {
		if (onCommand) {
			onCommand(id);
		}
		if (appContext.isNarrow) {
			updateShowButtons(false);
		}
		e.preventDefault();
	};

	// const onResize = e => {
	// 	let { innerWidth, innerHeight } = e.target;
	// 	let newSize = { width: innerWidth, height: innerHeight };

	// 	updateSize(newSize);
	// 	calcIsNarrow(newSize);
	// };

	// //ComponentDidMounted
	// useEffect(() => {
	// 	window.addEventListener("resize", onResize);
	// 	calcIsNarrow(wSize);
	// 	return () => {
	// 		window.removeEventListener("resize", onResize);
	// 	};
	// }, []);

	useEffect(() => {
		updateShowButtons(!appContext.isNarrow);
	}, [appContext.isNarrow]);

	// const calcIsNarrow = ({ width, height }) => {
	// 	let isNarrow = width / height < 0.7;
	// 	//updateIsNarrow(isNarrow);
	// 	appContext.setIsNarrow(isNarrow);
	// 	updateShowButtons(!isNarrow);
	// };

	const toggleButtons = () => {
		updateShowButtons(!showButtons);
	};

	return (
		<div className="Sidebar">
			<button
				onClick={toggleButtons}
				style={{ display: appContext.isNarrow ? "block" : "none" }}
			>
				<FontAwesomeIcon
					icon={showButtons ? faAngleDoubleUp : faAngleDoubleDown}
				/>
			</button>
			<div
				className="ButtonsList"
				style={{ display: showButtons ? "block" : "none" }}
			>
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
		</div>
	);
}

export default withAppContext(Sidebar);
