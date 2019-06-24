import React, { useState, useEffect } from "react";
import { withAppContext } from "../../context/App";

const VerseLayout = ({ page, appContext }) => {
	const [versesInfo, setAyaInfo] = useState([]);

	function renderVerses() {
		const pageHeight = appContext.appHeight - 50;
		const lineHeight = pageHeight / 15;
		const lineWidth = appContext.pageWidth();
		const buttonWidth = lineWidth / 10;

		const onClickVerse = ({ target }) => {
			const verseIndex = target.getAttribute("verse-index");
			const verse = versesInfo[verseIndex];
			//alert(JSON.stringify(e));
			//console.log(e);

			alert(JSON.stringify(verse));
		};

		return versesInfo.map((verse, index) => {
			return (
				<button
					key={index}
					verse-index={index}
					onClick={onClickVerse}
					style={{
						position: "absolute",
						width: buttonWidth,
						height: lineHeight,
						backgroundColor: "rgba(50,50,50,.15)",
						top: (verse.eline * pageHeight) / 15,
						left: lineWidth - (verse.epos * lineWidth) / 1000
					}}
				>
					&nbsp;
				</button>
			);
		});
	}

	useEffect(() => {
		setAyaInfo([]);
		let pageNumber = parseInt(page) + 1;
		fetch(`/pg_map/pm_${pageNumber}.json`)
			.then(response => response.json())
			.then(({ child_list }) => {
				setAyaInfo(child_list);
			});
	}, [page]);

	return (
		<div
			className="VerseLayout"
			style={{
				direction: "ltr",
				width: appContext.pageWidth(),
				margin: "0" + (appContext.isNarrow ? "" : " 20px")
			}}
		>
			{renderVerses()}
		</div>
	);
};

export default withAppContext(VerseLayout);
