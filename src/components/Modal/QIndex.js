import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import QData from "../../services/QData";
import { FormattedMessage } from "react-intl";
import { AppConsumer } from "../../context/App";
import { PlayerConsumer, AudioState } from "../../context/Player";

const QIndex = ({ app, player }) => {
	const getSuraNames = () => {
		let suraNames = [];
		for (let i = 1; i <= 114; i++) {
			suraNames.push("Sura " + i);
		}
		return suraNames;
	};

	const gotoSura = ({ target }) => {
		app.hideMask();
		let index = parseInt(target.getAttribute("sura"));
		app.gotoSura(index);
		if (!app.isCompact && app.pagesCount === 1) {
			app.closePopup();
		}
		if (player.audioState !== AudioState.stopped) {
			player.stop();
		}
	};

	let tableRoot;

	useEffect(() => {
		let pageIndex = app.getCurrentPageIndex();
		let sura = QData.pageSura(pageIndex + 1);
		const currSuraBtn = tableRoot.querySelector(`button[sura='${sura}']`);
		if (currSuraBtn) {
			currSuraBtn.focus();
		}
	}, []);

	const { appWidth, pagesCount, appHeight, isWide, isCompact } = app;

	//TODO: move to App.js
	const popupWidth = () => {
		if (isWide) {
			return appWidth - appHeight * 1.25;
		}
		if (isCompact) {
			return appWidth - appHeight * 0.65;
		}
		return appWidth / pagesCount;
	};

	return (
		<>
			<div className="Title">
				<FormattedMessage id="index" />
			</div>
			<div className="PopupBody" style={{ maxHeight: app.appHeight - 85 }}>
				<ul
					className="SpreadSheet"
					style={{
						columnCount: Math.floor((popupWidth() - 50) / 120) //-50px margin
					}}
					ref={ref => {
						tableRoot = ref;
					}}
				>
					{getSuraNames().map((name, index) => {
						return (
							<li key={index}>
								<button sura={index} onClick={gotoSura}>
									<FormattedMessage id={"sura_names"}>
										{data => {
											return index + 1 + ". " + data.split(",")[index];
										}}
									</FormattedMessage>
								</button>
							</li>
						);
					})}
				</ul>
			</div>
		</>
	);
};

export default AppConsumer(PlayerConsumer(QIndex));
