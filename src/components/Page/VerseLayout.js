import React, { useState, useEffect } from "react";
import { withAppContext } from "../../context/App";
import QData from "../../services/QData";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

const VerseLayout = ({ page: pageIndex, appContext }) => {
	const [versesInfo, setAyaInfo] = useState([]);
	const [hoverVerse, setHoverVerse] = useState(-1);
	const hoverColor = "#0000FF1A";
	const maskColor = "#998";
	const maskHoverColor = "#888";

	function renderVerses() {
		const pageHeight = appContext.appHeight - 50;
		const lineHeight = pageHeight / 15;
		const lineWidth = appContext.pageWidth();
		// const buttonWidth = lineWidth / 10;

		const onMouseEnter = ({ target }) => {
			setHoverVerse(parseInt(target.getAttribute("aya-id")));
		};

		const onMouseLeave = () => {
			setHoverVerse(-1);
		};

		const onContextMenu = e => {
			const aya_id = parseInt(e.target.getAttribute("aya-id"));
			appContext.setMaskStart(appContext.maskStart === -1 ? aya_id : -1);
			e.preventDefault();
		};

		const closeMask = e => {
			appContext.setMaskStart(-1);
		};

		const isHovered = aya_id => hoverVerse === aya_id;
		const isMasked = aya_id => {
			let { maskStart } = appContext;
			if (maskStart !== -1 && aya_id >= maskStart) {
				return true;
			}
			return false;
		};

		const onClickVerse = ({ target }) => {
			const aya_id = parseInt(target.getAttribute("aya-id"));
			//TODO: set selectStart|selectEnd|maskStart
			if (appContext.maskStart !== -1) {
				if (appContext.maskStart > aya_id) {
					appContext.setMaskStart(aya_id);
				} else {
					let nPageIndex = parseInt(pageIndex);
					let maskStartPage = QData.ayaIdPage(appContext.maskStart);
					if (maskStartPage === nPageIndex) {
						//same page
						appContext.offsetMask(1);
					} else {
						let clickedPage = QData.ayaIdPage(aya_id);
						let clickedPageFirstAyaId = QData.pageAyaId(clickedPage);

						appContext.setMaskStart(clickedPageFirstAyaId + 1); //TODO: unmask the first page aya
					}
				}
			}
		};

		const ayaBackgroundColor = aya_id => {
			let bg = "transparent";
			let hovered = isHovered(aya_id);
			if (hovered) {
				bg = hoverColor;
			}
			if (isMasked(aya_id)) {
				bg = maskColor;
				if (hovered) {
					bg = maskHoverColor;
				}
			}
			return bg;
		};

		const verseHead = ({ aya_id, sura, aya, sline, spos, eline, epos }) => {
			let backgroundColor = ayaBackgroundColor(aya_id);

			const maskClose = aya_id => {
				if (aya_id === appContext.maskStart) {
					let right = (spos * lineWidth) / 1000 - lineHeight / 2;
					if (right < 0) {
						right = 0;
					}
					return (
						<button
							onClick={closeMask}
							style={{
								position: "absolute",
								width: lineHeight,
								height: lineHeight,
								top: (sline * pageHeight) / 15,
								right,
								backgroundColor: "#777"
							}}
						>
							<FontAwesomeIcon icon={faTimes} />
						</button>
					);
				}
			};

			return (
				<>
					<div
						onClick={onClickVerse}
						onMouseEnter={onMouseEnter}
						onMouseLeave={onMouseLeave}
						onContextMenu={onContextMenu}
						aya-id={aya_id}
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
							backgroundColor
						}}
					/>
					{maskClose(aya_id)}
				</>
			);
		};

		const verseTail = ({ aya_id, sura, aya, sline, spos, eline, epos }) => {
			if (eline - sline > 0) {
				let backgroundColor = ayaBackgroundColor(aya_id);
				return (
					<div
						onClick={onClickVerse}
						onMouseEnter={onMouseEnter}
						onMouseLeave={onMouseLeave}
						onContextMenu={onContextMenu}
						aya-id={aya_id}
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
							backgroundColor
						}}
					/>
				);
			}
		};

		const verseBody = ({ aya_id, sura, aya, sline, spos, eline, epos }) => {
			if (eline - sline > 1) {
				let backgroundColor = ayaBackgroundColor(aya_id);
				return (
					<div
						onClick={onClickVerse}
						onMouseEnter={onMouseEnter}
						onMouseLeave={onMouseLeave}
						onContextMenu={onContextMenu}
						aya-id={aya_id}
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
							backgroundColor
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
		let pageNumber = parseInt(pageIndex) + 1;
		fetch(`/pg_map/pm_${pageNumber}.json`)
			.then(response => response.json())
			.then(({ child_list }) => {
				setAyaInfo(
					child_list.map(c => {
						const aya_id = QData.ayaID(c.sura, c.aya);
						let epos = c.epos;
						if (epos > 980) {
							epos = 1000;
						}
						return { ...c, epos, aya_id };
					})
				);
			});
	}, [pageIndex]);

	return (
		<div
			className="VerseLayout"
			style={{
				direction: "ltr",
				width: appContext.pageWidth(),
				margin: appContext.pageMargin()
			}}
		>
			{renderVerses()}
		</div>
	);
};

export default withAppContext(VerseLayout);
