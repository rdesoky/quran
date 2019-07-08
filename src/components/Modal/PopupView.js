import React from "react";
import { withAppContext } from "../../context/App";
import GotoPage from "./GotoPage";
import QIndex from "./QIndex";
import Commands from "./Commands";

function PopupView({ appContext }) {
	const onClosePopup = () => {
		appContext.setPopup(null);
	};

	const renderPopup = () => {
		let { popup } = appContext;
		switch (popup) {
			case "Commands":
				return <Commands onClose={onClosePopup} open={popup === "Commands"} />;
			case "Goto":
				return <GotoPage onClose={onClosePopup} open={popup === "Goto"} />;
			case "Index":
				return <QIndex onClose={onClosePopup} open={popup === "Index"} />;
			default:
				return null;
		}
	};

	return renderPopup();
}

export default withAppContext(PopupView);
