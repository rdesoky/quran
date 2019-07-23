import React, { useState, useEffect } from "react";
import { withAppContext } from "../../context/App";
import QData from "../../services/QData";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

const VerseLayout = ({ page: pageIndex, appContext, children }) => {
	const [versesInfo, setAyaInfo] = useState([]);
	const [hoverVerse, setHoverVerse] = useState(-1);

	const pageHeight = appContext.appHeight - 50;
	const lineHeight = pageHeight / 15;
	const lineWidth = appContext.pageWidth();

	const closeMask = e => {
		appContext.hideMask();
	};

	const onMouseEnter = ({ target }) => {
		setHoverVerse(parseInt(target.getAttribute("aya-id")));
	};

	const onMouseLeave = () => {
		setHoverVerse(-1);
	};

	//TODO: extend selection instead of masking
	const onContextMenu = e => {
		// const aya_id = parseInt(e.target.getAttribute("aya-id"));
		// appContext.setMaskStart(appContext.maskStart === -1 ? aya_id : -1);

		onClickVerse({ target: e.target, shiftKey: true });
		e.preventDefault();
	};

	const isHovered = aya_id => hoverVerse === aya_id;
	const isSelected = aya_id => {
		const start = Math.min(appContext.selectStart, appContext.selectEnd);
		const end = Math.max(appContext.selectStart, appContext.selectEnd);
		return aya_id >= start && aya_id <= end;
	};
	const isMasked = aya_id => {
		let { maskStart } = appContext;
		if (maskStart !== -1 && aya_id >= maskStart) {
			return true;
		}
		return false;
	};

	const onClickVerse = e => {
		const { shiftKey, ctrlKey, altKey, target } = e;
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
		} else {
			if (shiftKey || ctrlKey) {
				appContext.extendSelection(aya_id);
			} else {
				if (appContext.selectStart === aya_id && appContext.popup === null) {
					appContext.toggleShowMenu();
					e.stopPropagation();
				} else {
					appContext.selectAya(aya_id);
				}
			}
		}
	};

	const ayaClass = aya_id => {
		let className = "";
		let selected = isSelected(aya_id);
		if (selected) {
			className = "Selected";
		}
		let hovered = isHovered(aya_id);
		if (hovered) {
			className += " Hovered";
		}
		if (isMasked(aya_id)) {
			className = "Masked";
			if (selected) {
				className += " Selected";
			}
		}
		return className.trim();
	};

	const verseHead = ({ aya_id, sura, aya, sline, spos, eline, epos }) => {
		let aClass = ayaClass(aya_id);

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
				className={["Verse VerseHead", aClass].join(" ").trim()}
				style={{
					height: lineHeight,
					top: (sline * pageHeight) / 15,
					right: (spos * lineWidth) / 1000,
					left: sline === eline ? ((1000 - epos) * lineWidth) / 1000 : 0
				}}
			/>
		);
	};

	const verseTail = ({ aya_id, sura, aya, sline, spos, eline, epos }) => {
		if (eline - sline > 0) {
			let aClass = ayaClass(aya_id);
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
					className={["Verse VerseTail", aClass].join(" ").trim()}
					style={{
						height: lineHeight,
						top: (eline * pageHeight) / 15,
						right: 0,
						left: lineWidth - (epos * lineWidth) / 1000
					}}
				/>
			);
		}
	};

	const verseBody = ({ aya_id, sura, aya, sline, spos, eline, epos }) => {
		if (eline - sline > 1) {
			let aClass = ayaClass(aya_id);
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
					className={["Verse VerseBody", aClass].join(" ").trim()}
					style={{
						height: lineHeight * (eline - sline - 1),
						top: ((parseInt(sline) + 1) * pageHeight) / 15,
						right: 0,
						left: 0
					}}
				/>
			);
		}
	};

	const verseStructure = verse => {
		return (
			<>
				{verseHead(verse)}
				{verseBody(verse)}
				{verseTail(verse)}
			</>
		);
	};

	function renderMask() {
		const { maskStart } = appContext;
		if (maskStart === -1) {
			return;
		}
		const maskStartPage = QData.ayaIdPage(maskStart);
		if (maskStartPage > pageIndex) {
			return;
		}

		const fullPageMask = () => {
			return (
				<div
					className="Mask MaskBody"
					style={{
						top: 0,
						bottom: 0,
						left: 0,
						right: 0
					}}
				/>
			);
		};

		if (maskStartPage === pageIndex) {
			let maskStartInfo = versesInfo.find(v => v.aya_id === maskStart);
			if (maskStartInfo) {
				const { sline, spos, eline, epos } = maskStartInfo;
				let right = (spos * lineWidth) / 1000;
				let closeBtnRight = right - lineHeight / 2;
				if (closeBtnRight < 0) {
					closeBtnRight = 0;
				}
				return (
					<>
						<div
							className="Mask Head"
							style={{
								height: lineHeight,
								top: (sline * pageHeight) / 15,
								right,
								left: 0
							}}
						/>
						<div
							className="Mask MaskBody"
							style={{
								top: ((parseInt(sline) + 1) * pageHeight) / 15,
								bottom: 0,
								right: 0,
								left: 0
							}}
						/>
						{verseStructure(maskStartInfo)}
						<button
							onClick={closeMask}
							style={{
								pointerEvents: "visible",
								position: "absolute",
								width: lineHeight,
								height: lineHeight,
								top: (sline * pageHeight) / 15,
								right: closeBtnRight,
								backgroundColor: "#777"
							}}
						>
							<FontAwesomeIcon icon={faTimes} />
						</button>
					</>
				);
			} else {
				return fullPageMask();
			}
		} else {
			return fullPageMask();
		}
	}

	function renderVerses() {
		return versesInfo.map((verse, index) => {
			return <div key={index}>{verseStructure(verse)}</div>;
		});
	}

	//Handle pageIndex update
	useEffect(() => {
		setAyaInfo([]);
		let pageNumber = parseInt(pageIndex) + 1;
		let controller = new AbortController();
		let url = `${process.env.PUBLIC_URL}/pg_map/pm_${pageNumber}.json`;
		fetch(url, {
			signal: controller.signal
		})
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
			})
			.catch(e => {
				const { name, message } = e;
				console.info(`${name}: ${message}\n${url}`);
			});
		return () => {
			//Cleanup function
			controller.abort();
		};
	}, [pageIndex]);

	return (
		<>
			<div
				className="VerseLayout"
				style={{
					direction: "ltr",
					width: appContext.pageWidth(),
					height: appContext.pageHeight(),
					margin: appContext.pageMargin()
				}}
			>
				{renderVerses()}
			</div>
			{children}
			<div
				className="MaskContainer"
				style={{
					direction: "ltr",
					top: 0,
					width: appContext.pageWidth(),
					height: appContext.pageHeight(),
					margin: appContext.pageMargin()
				}}
			>
				{renderMask()}
			</div>
		</>
	);
};

export default withAppContext(VerseLayout);
