import React, { useState, useEffect } from "react";
import Page from "../Page/Page";
import { withAppContext } from "../../context/App";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleRight, faAngleLeft } from "@fortawesome/free-solid-svg-icons";
import QData from "../../services/QData";
import "./Pager.scss";

function Pager({ match, appContext }) {
	let pageIndex = 0;
	const REPLACE = true;

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
		let { maskStart } = appContext;
		if (maskStart !== -1) {
			//Mask is active
			if (maskStart <= 0) {
				return;
			}
			let maskNewPageNum = QData.ayaIdPage(maskStart - 1) + 1;
			if (maskNewPageNum !== parseInt(match.params.page)) {
				//Mask would move to a new page
				appContext.gotoPage(maskNewPageNum, REPLACE);
				if (appContext.pagesCount === 1 || maskNewPageNum % 2 === 0) {
					return; //Don't move mask
				}
			}
			appContext.offsetMask(-1);
		} else {
			appContext.offsetPage(-1);
		}
	};

	const increment = e => {
		let { maskStart } = appContext;
		if (maskStart !== -1) {
			//Mask is active
			if (maskStart >= QData.ayatCount()) {
				return;
			}
			let currPageNum = parseInt(match.params.page);
			let maskPageNum = QData.ayaIdPage(maskStart) + 1;
			if (maskPageNum !== currPageNum) {
				appContext.gotoPage(maskPageNum, REPLACE);
				return;
			}
			appContext.offsetMask(1);
			let maskNewPageNum = QData.ayaIdPage(maskStart + 1) + 1;
			if (maskNewPageNum !== currPageNum) {
				//Mask would move to a new page
				if (appContext.pagesCount === 1 || maskNewPageNum % 2 === 1) {
					return; //Don't change page
				}
				appContext.gotoPage(maskNewPageNum, REPLACE);
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

	const offsetSelection = offset => {
		let selectStart = appContext.offsetSelection(offset);
		let currPageNum = parseInt(match.params.page);
		let selectionPageNum = QData.ayaIdPage(selectStart) + 1;
		if (currPageNum !== selectionPageNum) {
			appContext.gotoPage(selectionPageNum, REPLACE);
		}
	};

	const handleKeyDown = e => {
		if (appContext.popup !== null) {
			return;
		}
		switch (e.key) {
			case "Escape":
				if (appContext.maskStart !== -1) {
					appContext.hideMask();
				}
				break;
			case "ArrowDown":
				if (appContext.maskStart !== -1) {
					increment(e);
				} else {
					offsetSelection(1);
				}
				break;
			case "ArrowUp":
				if (appContext.maskStart !== -1) {
					decrement(e);
				} else {
					offsetSelection(-1);
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
