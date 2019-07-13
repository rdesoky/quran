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

function PopupView({ appContext }) {
	const onClosePopup = () => {
		appContext.setPopup(null);
	};

	const componentMap = {
		Commands,
		Goto: GotoPage,
		Index: QIndex,
		Search,
		Play,
		Hifz,
		Help,
		Settings
	};

	const renderPopup = () => {
		let { popup } = appContext;
		let Component = componentMap[popup];
		if (Component === undefined) {
			return null;
		}
		return <Component onClose={onClosePopup} />;
	};

	return renderPopup();
}

export default withAppContext(PopupView);
