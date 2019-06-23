import React, { useState, useEffect } from "react";
import { withAppContext } from "../../context/App";

const VerseLayout = ({ page, appContext }) => {
	const [versesInfo, setAyaInfo] = useState([]);

	function renderVerses() {
		let ret = "";
		return versesInfo.map(verse => {
			return <button>Aya</button>;
		});
	}

	useEffect(() => {
		let pageNumber = parseInt(page) + 1;
		fetch(
			"http://www.kobool.com/cgi-bin/quran/get_page_layout.pl?pg=" + pageNumber
		)
			.then(response => response.json())
			.then(({ child_list }) => {
				setAyaInfo(child_list);
			});
	}, [page]);

	return (
		<div
			className="VerseLayout"
			style={{
				padding: "0" + (appContext.isNarrow ? "" : " 20px")
			}}
			onClick={e => alert("Clicked")}
		>
			{renderVerses()}
		</div>
	);
};

export default withAppContext(VerseLayout);
