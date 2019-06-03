import React, { useState, useEffect } from "react";
import Page from "../Page/Page";
import "./Pager.scss";

function Pager(props) {
	const calcPagesCount = size => {
		return size.width > size.height * 1.3 ? 2 : 1;
	};

	const [wSize, updateSize] = useState({
		width: window.innerWidth,
		height: window.innerHeight
	});
	const [pageNumber, setPageNumber] = useState(parseInt(props.number));
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

		return () => {
			window.removeEventListener("resize", onResize);
		};
	});

	function decrement(e) {
		if (pageNumber > 0) {
			setPageNumber(pageNumber - 1);
		}
	}

	function increment(e) {
		if (pageNumber < 602) {
			setPageNumber(pageNumber + 1);
		}
	}

	function handleWheel(e) {
		if (e.deltaY > 0) {
			//scroll down
			increment(e);
		} else {
			decrement(e);
		}
	}

	const renderPage = order => {
		if (pagesCount < order + 1) {
			return;
		}

		let page =
			pagesCount == 1 ? pageNumber : pageNumber - (pageNumber % 2) + order;

		let clickHandler =
			order == 1 ? increment : pagesCount == 2 ? decrement : increment;

		let pageClass = page % 2 == 0 ? " RightPage" : " LeftPage";
		let activeClass = pageNumber == page ? " Active" : "";

		let textAlign = pagesCount == 1 ? "center" : order == 0 ? "left" : "right";

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

	return (
		<div className="Pager" onWheel={handleWheel}>
			{renderPage(0)}
			{renderPage(1)}
		</div>
	);
}

export default Pager;
