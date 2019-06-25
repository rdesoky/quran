import React, { useState, useEffect } from "react";
import Page from "../Page/Page";

import { withRouter } from "react-router-dom";
import { withAppContext } from "../../context/App";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleRight, faAngleLeft } from "@fortawesome/free-solid-svg-icons";
import "./Pager.scss";

function Pager({ match, appContext }) {
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
	//useEffect(() => {}, []);

	const decrement = e => {
		if (appContext.maskStart !== -1) {
			let pageIndex = appContext.offsetMask(-1);
			if (pageIndex + 1 !== parseInt(match.params.page)) {
				appContext.gotoPage(pageIndex + 1);
			}
		} else {
			appContext.offsetPage(-1);
		}
	};

	const increment = e => {
		if (appContext.maskStart !== -1) {
			let pageIndex = appContext.offsetMask(1);
			if (pageIndex + 1 !== parseInt(match.params.page)) {
				appContext.gotoPage(pageIndex + 1);
			}
		} else {
			appContext.offsetPage(1);
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
		if (appContext.popup !== null) {
			return;
		}
		switch (e.key) {
			case "Escape":
				if (appContext.maskStart !== -1) {
					appContext.setMaskStart(-1);
				}
				break;
			case "ArrowDown":
				if (appContext.maskStart !== -1) {
					increment(e);
				}
				break;
			case "ArrowUp":
				if (appContext.maskStart !== -1) {
					decrement(e);
				}
				break;
			case "PageDown":
			case "ArrowLeft":
				increment(e);
				break;
			case "PageUp":
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

		let thisPage =
			appContext.pagesCount === 1
				? pageIndex
				: pageIndex - (pageIndex % 2) + order;

		function selectPage() {
			if (pageIndex !== thisPage) {
				appContext.history.replace("/page/" + (thisPage + 1).toString());
			}
		}

		let pageClass = thisPage % 2 === 0 ? " RightPage" : " LeftPage";
		let activeClass = pageIndex === thisPage ? " Active" : "";

		// let textAlign =
		// 	appContext.pagesCount === 1 ? "center" : order === 0 ? "left" : "right";

		return (
			<div
				onClick={selectPage}
				className={"PageSide" + pageClass + activeClass}
				style={{
					height: appContext.appHeight + "px",
					width: 100 / appContext.pagesCount + "%"
					// textAlign: textAlign
				}}
			>
				<Page index={thisPage} order={order} />
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

export default withAppContext(Pager);
