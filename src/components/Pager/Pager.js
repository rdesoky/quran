import React, { useState, useEffect } from "react";
import Page from "../Page/Page";
import "./Pager.scss";

import { withRouter } from "react-router-dom";
import { withAppContext } from "../../context/AppProvider";

function Pager({ match, history, appContext }) {
	let pageIndex = 0;

	// const [wSize, updateSize] = useState({
	// 	width: window.innerWidth,
	// 	height: window.innerHeight
	// });

	//const [leftMargin, updateLeftMargin] = useState(50);

	const { page, sura } = match.params;

	//const [pagesCount, setPagesCount] = useState(calcPagesCount(wSize));

	//ComponentDidMount
	useEffect(() => {
		document.addEventListener("keydown", handleKeyDown);
		return () => {
			//window.removeEventListener("resize", onResize);
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, []);

	const decrement = e => {
		if (pageIndex > 0) {
			//setPageIndex(pageIndex - 1);
			history.push("/page/" + pageIndex.toString());
		}
	};

	const increment = e => {
		if (pageIndex < 602) {
			//setPageIndex(pageIndex + 1);
			history.push("/page/" + (pageIndex + 2).toString());
		}
	};

	const handleWheel = e => {
		if (e.deltaY > 0) {
			//scroll down
			increment(e);
		} else {
			decrement(e);
		}
	};

	const handleKeyDown = e => {
		if (e.target !== document.body) {
			return;
		}
		switch (e.key) {
			case "PageDown":
			// case "ArrowDown":
			case "ArrowLeft":
				increment(e);
				break;
			case "PageUp":
			// case "ArrowUp":
			case "ArrowRight":
				decrement(e);
				break;
			default:
				break;
		}
	};

	const renderPage = order => {
		if (appContext.pagesCount < order + 1) {
			return;
		}

		let page =
			appContext.pagesCount === 1
				? pageIndex
				: pageIndex - (pageIndex % 2) + order;

		let clickHandler =
			order === 1
				? increment
				: appContext.pagesCount === 2
				? decrement
				: increment;

		let pageClass = page % 2 === 0 ? " RightPage" : " LeftPage";
		let activeClass = pageIndex === page ? " Active" : "";

		let textAlign =
			appContext.pagesCount === 1 ? "center" : order === 0 ? "left" : "right";

		return (
			<div
				className={"PageSide" + pageClass + activeClass}
				onClick={clickHandler}
				style={{
					height: appContext.appHeight + "px",
					width: 100 / appContext.pagesCount + "%",
					textAlign: textAlign
				}}
			>
				<Page number={page} />
			</div>
		);
	};

	const leftMargin = () => {
		return appContext.isNarrow ? 0 : 50;
	};

	if (page !== undefined) {
		pageIndex = parseInt(page) - 1;
	}
	if (sura !== undefined) {
		pageIndex = 0; //find sura page
	}

	return (
		<div
			className="Pager"
			onWheel={handleWheel}
			style={{ width: (appContext.appWidth - leftMargin()).toString() + "px" }}
		>
			{renderPage(0)}
			{renderPage(1)}
		</div>
	);
}

export default withRouter(withAppContext(Pager));
