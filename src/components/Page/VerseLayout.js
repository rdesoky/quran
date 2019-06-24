import React, { useState, useEffect } from "react";
import { withAppContext } from "../../context/App";

const VerseLayout = ({ page, appContext }) => {
	const [versesInfo, setAyaInfo] = useState([]);
	const [hoverVerse, setHoverVerse] = useState(null);
	const hoverColor = "#0000FF30";

	function renderVerses() {
		const pageHeight = appContext.appHeight - 50;
		const lineHeight = pageHeight / 15;
		const lineWidth = appContext.pageWidth();
		const buttonWidth = lineWidth / 10;

		const onClickVerse = ({ target }) => {
			const verseIndex = target.getAttribute("verse-index");
			const verse = versesInfo[verseIndex];
			// alert(JSON.stringify(verse));
			//console.log(e);

			console.log(verse);
		};

		const onMouseEnter = ({ target }) => {
			setHoverVerse(
				target.getAttribute("sura") + "." + target.getAttribute("aya")
			);
		};

		const onMouseLeave = ({ target }) => {
			setHoverVerse(-1);
		};

		const verseHead = ({ sura, aya, sline, spos, eline, epos }) => {
			return (
				<div
					onMouseEnter={onMouseEnter}
					onMouseLeave={onMouseLeave}
					sura={sura}
					aya={aya}
					sline={sline}
					eline={eline}
					spos={spos}
					epos={epos}
					className="Verse VerseHead"
					style={{
						height: lineHeight,
						top: (sline * pageHeight) / 15,
						right: (spos * lineWidth) / 1000,
						left: sline === eline ? ((1000 - epos) * lineWidth) / 1000 : 0,
						backgroundColor:
							hoverVerse === `${sura}.${aya}` ? hoverColor : "transparent"
					}}
				/>
			);
		};

		const verseTail = ({ sura, aya, sline, spos, eline, epos }) => {
			if (eline - sline > 0) {
				return (
					<div
						onMouseEnter={onMouseEnter}
						onMouseLeave={onMouseLeave}
						sura={sura}
						aya={aya}
						sline={sline}
						eline={eline}
						spos={spos}
						epos={epos}
						className="Verse VerseTail"
						style={{
							height: lineHeight,
							top: (eline * pageHeight) / 15,
							right: 0,
							left: lineWidth - (epos * lineWidth) / 1000,
							backgroundColor:
								hoverVerse === `${sura}.${aya}` ? hoverColor : "transparent"
						}}
					/>
				);
			}
		};

		const verseBody = ({ sura, aya, sline, spos, eline, epos }) => {
			if (eline - sline > 1) {
				return (
					<div
						onMouseEnter={onMouseEnter}
						onMouseLeave={onMouseLeave}
						sura={sura}
						aya={aya}
						sline={sline}
						eline={eline}
						spos={spos}
						epos={epos}
						className="Verse VerseBody"
						style={{
							height: lineHeight * (eline - sline - 1),
							top: ((parseInt(sline) + 1) * pageHeight) / 15,
							right: 0,
							left: 0,
							backgroundColor:
								hoverVerse === `${sura}.${aya}` ? hoverColor : "transparent"
						}}
					/>
				);
			}
		};

		return versesInfo.map((verse, index) => {
			return (
				<div key={index}>
					{verseHead(verse)}
					{verseBody(verse)}
					{verseTail(verse)}
					{/* <button
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
					</button> */}
				</div>
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
		// return () => {
		// 	//loading.stop();
		// };
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
