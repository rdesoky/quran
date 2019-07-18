import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import Utils from "../../services/utils";
import QData from "../../services/QData";
import { FormattedMessage } from "react-intl";
import { withAppContext } from "../../context/App";

const Tafseer = ({ onClose, isOpen, appContext }) => {
	const [tafseer, setTafseer] = useState([]);

	const handleKeyDown = e => {
		let ayaId;
		switch (e.code) {
			case "ArrowDown":
			case "ArrowLeft":
				ayaId = appContext.offsetSelection(1);
				break;
			case "ArrowUp":
			case "ArrowRight":
				ayaId = appContext.offsetSelection(-1);
				break;
			default:
				return;
		}
		appContext.gotoAya(ayaId);
	};
	useEffect(() => {
		//document.querySelector(".CancelButton").focus();
		fetch(`${process.env.PUBLIC_URL}/ar.muyassar.txt`)
			.then(r => r.text())
			.then(txt => {
				setTafseer(txt.split("\n"));
			});
		document.addEventListener("keydown", handleKeyDown);
		return () => {
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, []);

	const renderVerse = () => {
		const verseList = appContext.verseList();
		if (verseList.length > appContext.selectStart) {
			return verseList[appContext.selectStart];
		}
	};
	const renderTafseer = () => {
		if (tafseer.length > appContext.selectStart) {
			return tafseer[appContext.selectStart];
		}
		return "Loading...";
	};

	return (
		<Modal open={isOpen} onClose={onClose}>
			<div className="Title">{renderVerse()}</div>
			<div className="TafseerText">{renderTafseer()}</div>
		</Modal>
	);
};

export default withAppContext(Tafseer);
