import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import Utils from "../../services/utils";
import QData from "../../services/QData";
import { FormattedMessage } from "react-intl";
import { withAppContext } from "../../context/App";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft, faAngleRight } from "@fortawesome/free-solid-svg-icons";

const Tafseer = ({ onClose, isOpen, appContext }) => {
	const [tafseer, setTafseer] = useState([]);

	const handleKeyDown = e => {
		switch (e.code) {
			case "ArrowDown":
			case "ArrowLeft":
				offsetSelection(1);
				break;
			case "ArrowUp":
			case "ArrowRight":
				offsetSelection(-1);
				break;
			default:
				return;
		}
	};

	const offsetSelection = offset => {
		const ayaId = appContext.offsetSelection(offset);
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

	const ayaInfo = QData.ayaIdInfo(appContext.selectStart);
	return (
		<Modal open={isOpen} onClose={onClose}>
			<div className="Title">
				<button onClick={e => offsetSelection(-1)}>
					<FontAwesomeIcon icon={faAngleRight} />
				</button>
				<FormattedMessage id="sura_names">
					{sura_names => (
						<span>
							{sura_names.split(",")[ayaInfo.sura] + ` - ${ayaInfo.aya + 1}`}
						</span>
					)}
				</FormattedMessage>
				<button onClick={e => offsetSelection(1)}>
					<FontAwesomeIcon icon={faAngleLeft} />
				</button>
			</div>
			<p className="TafseerVerse">{renderVerse()}</p>

			<p className="TafseerText">{renderTafseer()}</p>
		</Modal>
	);
};

export default withAppContext(Tafseer);
