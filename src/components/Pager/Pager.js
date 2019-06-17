import React, { useState, useEffect } from "react";
import Page from "../Page/Page";
import "./Pager.scss";

import { withRouter } from "react-router-dom";

function Pager(props) {
	const calcPagesCount = size => {
		return size.width > size.height * 1.35 ? 2 : 1;
	};

	const [wSize, updateSize] = useState({
		width: window.innerWidth,
		height: window.innerHeight
	});

	const { page, sura } = props.match.params;

	let pageIndex = 0;

	if (page !== undefined) {
		pageIndex = parseInt(page) - 1;
	}
	if (sura !== undefined) {
		pageIndex = 5; //find sura page
	}

	const [pagesCount, setPagesCount] = useState(calcPagesCount(wSize));

	const onResize = e => {
		let { innerWidth, innerHeight } = e.target;
		let newSize = { width: innerWidth, height: innerHeight };

		updateSize(newSize);
		let count = calcPagesCount(newSize);
		setPagesCount(count);
	};

	useEffect(() => {
		window.addEventListener("resize", onResize);
		document.addEventListener("keydown", handleKeyDown);

		return () => {
			window.removeEventListener("resize", onResize);
			document.removeEventListener("keydown", handleKeyDown);
		};
	});

	const decrement = e => {
		if (pageIndex > 0) {
			//setPageIndex(pageIndex - 1);
			props.history.push("/page/" + pageIndex.toString());
		}
	};

	const increment = e => {
		if (pageIndex < 602) {
			//setPageIndex(pageIndex + 1);
			props.history.push("/page/" + (pageIndex + 2).toString());
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
			case "ArrowDown":
			case "ArrowLeft":
				increment(e);
				break;
			case "PageUp":
			case "ArrowUp":
			case "ArrowRight":
				decrement(e);
				break;
			default:
				break;
		}
	};

	const renderPage = order => {
		if (pagesCount < order + 1) {
			return;
		}

		let page =
			pagesCount === 1 ? pageIndex : pageIndex - (pageIndex % 2) + order;

		let clickHandler =
			order === 1 ? increment : pagesCount === 2 ? decrement : increment;

		let pageClass = page % 2 === 0 ? " RightPage" : " LeftPage";
		let activeClass = pageIndex === page ? " Active" : "";

		let textAlign =
			pagesCount === 1 ? "center" : order === 0 ? "left" : "right";

		return (
			<div
				className={"PageSide" + pageClass + activeClass}
				onClick={clickHandler}
				style={{
					height: wSize.height + "px",
					width: 100 / pagesCount + "%",
					textAlign: textAlign
				}}
			>
				<Page number={page} />
			</div>
		);
	};

	const renderGutter = () => {
		if (pagesCount > 1) {
			return <div className="Gutter" />;
		}
	};

	return (
		<div className="Pager" onWheel={handleWheel}>
			{renderPage(0)}
			{renderPage(1)}
		</div>
	);
}

export default withRouter(Pager);
