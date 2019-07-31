import React from "react";
import { withAppContext } from "../../context/App";
import GotoPage from "./GotoPage";
import QIndex from "./QIndex";
import Commands from "./Commands";
import Search from "./Search";
import Play from "./Play";
import Hifz from "./Hifz";
import Help from "./Help";
import Settings from "./Settings";
import Tafseer from "./Tafseer";
import Modal from "./Modal";

function PopupView({ appContext }) {
	const componentMap = {
		Commands,
		Goto: GotoPage,
		Index: QIndex,
		Search,
		Play,
		Hifz,
		Help,
		Settings,
		Tafseer
	};

	const onClose = () => {
		appContext.closePopup();
	};

	const { popup, showPopup } = appContext;
	const Component = componentMap[popup];

	if (Component !== undefined) {
		return (
			<Modal onClose={onClose} show={showPopup} name={popup}>
				<Component />
			</Modal>
		);
	}

	return null;
}

export default withAppContext(PopupView);
