import React, { useEffect } from "react";
import { Redirect } from "react-router-dom";
import Page from "../Page/Page";
import { withAppContext } from "../../context/App";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faAngleRight,
	faAngleLeft,
	faAngleDown,
	faAngleUp
} from "@fortawesome/free-solid-svg-icons";
import QData from "../../services/QData";
import "./Pager.scss";

function fnPageRedirect({ match, appContext }) {
	let { aya } = match.params;
	let pageNum = 1;

	if (aya !== undefined) {
		setTimeout(() => {
			appContext.selectAya(parseInt(aya));
		}, 10);
		pageNum = QData.ayaIdPage(aya) + 1;
	}
	return <Redirect to={process.env.PUBLIC_URL + "/page/" + pageNum} />;
}

function Pager({ match, appContext }) {
	let pageIndex = 0;
	const REPLACE = true;

	let { page } = match.params;

	// if (page !== undefined) {
	// 	appContext.setActivePage(parseInt(page) - 1);
	// }

	//ComponentDidUpdate
	useEffect(() => {
		page = match.params.page;
		//sura = match.params.sura;
		// aya = match.params.aya;

		// if (aya !== undefined) {
		// 	appContext.selectAya(aya);
		// }
		document.addEventListener("keydown", handleKeyDown);
		return () => {
			document.removeEventListener("keydown", handleKeyDown);
		};
	});

	//ComponentDidMount
	//useEffect(() => {}, []);

	const pageUp = e => appContext.offsetPage(-1);
	const pageDown = e => appContext.offsetPage(1);

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
			offsetSelection(e, -1);
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
			offsetSelection(e, 1);
		}
	};

	const handleWheel = e => {
		if (e.deltaY > 0) {
			//scroll down
			pageDown(e);
		} else {
			pageUp(e);
		}
	};

	const offsetSelection = ({ shiftKey }, offset) => {
		let selectedAyaId;
		if (shiftKey) {
			selectedAyaId = appContext.extendSelection(
				appContext.selectStart + offset
			);
		} else {
			selectedAyaId = appContext.offsetSelection(offset);
		}
		let currPageNum = parseInt(match.params.page);
		let selectionPageNum = QData.ayaIdPage(selectedAyaId) + 1;
		if (currPageNum !== selectionPageNum) {
			appContext.gotoPage(selectionPageNum, REPLACE);
		}
	};

	const handleKeyDown = e => {
		const { tagName, type } = document.activeElement;
		const isInput = ["INPUT", "BUTTON"].includes(tagName);
		const isTextInput = isInput && ["text", "number"].includes(type);
		switch (e.code) {
			// case "Enter":
			// 	if (!isTextInput && appContext.popup === null) {
			// 		appContext.selectAya();
			// 		appContext.setPopup("Tafseer");
			// 	}
			// 	break;
			case "Escape":
				if (appContext.popup !== null) {
					appContext.setPopup(null);
				} else if (appContext.maskStart !== -1) {
					appContext.hideMask();
				}
				break;
			case "KeyI":
				if (!isTextInput) {
					appContext.setPopup("Index");
				}
				break;
			case "KeyG":
				if (!isTextInput) {
					appContext.setPopup("Goto");
				}
				break;
			case "KeyC":
				if (!isTextInput) {
					appContext.setPopup("Commands");
				}
				break;
			case "KeyF":
				if (!isTextInput) {
					appContext.setPopup("Search");
				}
				break;
			case "KeyT":
				if (!isTextInput) {
					appContext.selectAya();
					appContext.setPopup("Tafseer");
				}
				break;
			case "KeyM":
				if (!isTextInput) {
					appContext.setMaskStart();
				}
				break;
			case "ArrowDown":
				if (!isTextInput) {
					if (appContext.maskStart !== -1) {
						increment(e);
					} else {
						offsetSelection(e, 1);
					}
				}
				break;
			case "ArrowUp":
				if (!isTextInput) {
					if (appContext.maskStart !== -1) {
						decrement(e);
					} else {
						offsetSelection(e, -1);
					}
				}
				break;
			case "PageDown":
			case "ArrowLeft":
				if (!isTextInput) {
					pageDown(e);
				}
				break;
			case "PageUp":
			case "ArrowRight":
				if (!isTextInput) {
					pageUp(e);
				}
				break;
			default:
				return;
		}
		if (!isTextInput) {
			e.preventDefault();
		}
	};

	if (page !== undefined) {
		pageIndex = parseInt(page) - 1;
	}
	// if (sura !== undefined) {
	// 	pageIndex = 0; //find sura page
	// }

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
				appContext.gotoPage(thisPage + 1);
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
			<div
				className="FooterNavbar"
				style={{ left: (appContext.isNarrow ? 0 : 50).toString() + "px" }}
			>
				<button className="NavButton NavPgUp" onClick={pageUp}>
					<FontAwesomeIcon icon={faAngleRight} />
				</button>
				<button className="NavButton NavPgDown" onClick={pageDown}>
					<FontAwesomeIcon icon={faAngleLeft} />
				</button>
				<button onClick={increment} className="NavButton NavForward">
					<FontAwesomeIcon icon={faAngleDown} />
				</button>
				<button className="NavButton NavBackward" onClick={decrement}>
					<FontAwesomeIcon icon={faAngleUp} />
				</button>
			</div>
		</div>
	);
}

export default withAppContext(Pager);
export let PageRedirect = withAppContext(fnPageRedirect);
