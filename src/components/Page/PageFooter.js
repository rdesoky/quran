import React from "react";
import { withAppContext } from "../../context/App";

const PageFooter = ({ index, appContext }) => {
	const showFindPopup = e => {
		appContext.setPopup("Find");
	};

	return (
		<div className="PageFooter">
			<button onClick={showFindPopup}>({index + 1})</button>
		</div>
	);
};

export default withAppContext(PageFooter);
