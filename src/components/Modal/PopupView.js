import React from "react";
import { withAppContext } from "../../context/AppProvider";
import GotoPage from "./GotoPage";
import QIndex from "./QIndex";

function PopupView({ appContext }) {
	const onClosePopup = () => {
		appContext.setPopup(null);
	};

	const renderPopup = () => {
		let { popup } = appContext;
		switch (popup) {
			case "Find":
				return <GotoPage onClose={onClosePopup} open={popup === "Find"} />;
			case "QIndex":
				return <QIndex onClose={onClosePopup} open={popup === "QIndex"} />;
			default:
				return null;
		}
	};

	return renderPopup();
}

export default withAppContext(PopupView);
