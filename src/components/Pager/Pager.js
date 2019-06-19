import React, { useState, useEffect } from "react";
import Page from "../Page/Page";

import { withRouter } from "react-router-dom";
import { withAppContext } from "../../context/AppProvider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleRight, faAngleLeft } from "@fortawesome/free-solid-svg-icons";
import "./Pager.scss";

function Pager({ match, history, appContext }) {
	let pageIndex = 0;

	let { page, sura } = match.params;

	//ComponentDidUpdate
	useEffect(() => {
		page = match.params.page;
		sura = match.params.sura;
		document.addEventListener("keydown", handleKeyDown);
		return () => {
			document.removeEventListener("keydown", handleKeyDown);
		};
	});

	//ComponentDidMount
	useEffect(() => {}, []);

	const decrement = e => {
		page = match.params.page;
		let nPage = parseInt(page);
		if (nPage > 1) {
			history.push("/page/" + (nPage - 1).toString());
		}
	};

	const increment = e => {
		page = match.params.page;
		let nPage = parseInt(page);
		if (nPage < 604) {
			history.push("/page/" + (nPage + 1).toString());
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

	if (page !== undefined) {
		pageIndex = parseInt(page) - 1;
	}
	if (sura !== undefined) {
		pageIndex = 0; //find sura page
	}

	const renderPage = order => {
		if (appContext.pagesCount < order + 1) {
			return;
		}

		let page =
			appContext.pagesCount === 1
				? pageIndex
				: pageIndex - (pageIndex % 2) + order;

		// let clickHandler =
		// 	order === 1
		// 		? increment
		// 		: appContext.pagesCount === 2
		// 		? decrement
		// 		: increment;

		let pageClass = page % 2 === 0 ? " RightPage" : " LeftPage";
		let activeClass = pageIndex === page ? " Active" : "";

		let textAlign =
			appContext.pagesCount === 1 ? "center" : order === 0 ? "left" : "right";

		return (
			<div
				className={"PageSide" + pageClass + activeClass}
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

	return (
		<div
			className="Pager"
			onWheel={handleWheel}
			style={{ width: (appContext.appWidth - leftMargin()).toString() + "px" }}
		>
			{renderPage(0)}
			{renderPage(1)}
			<button className="NavButton NavBackward" onClick={decrement}>
				<FontAwesomeIcon icon={faAngleRight} />
			</button>
			<button
				onClick={increment}
				className="NavButton NavForward"
				style={{ left: (appContext.isNarrow ? 0 : 50).toString() + "px" }}
			>
				<FontAwesomeIcon icon={faAngleLeft} />
			</button>
		</div>
	);
}

export default withRouter(withAppContext(Pager));
