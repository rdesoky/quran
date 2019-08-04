import React from "react";
import { AppConsumer } from "../../context/App";
import { FormattedMessage } from "react-intl";

const PageFooter = ({ index: pageIndex, app, order }) => {
	const showGotoPopup = e => {
		app.setPopup("Goto");
	};

	let textAlign =
		app.pagesCount === 1 ? "center" : order === 0 ? "left" : "right";

	return (
		<div className="PageFooter" style={{ textAlign }}>
			<div
				style={{
					width: app.pageWidth(),
					margin: app.pageMargin()
				}}
				className="PageHeaderContent"
			>
				<FormattedMessage id="pg">
					{pg => (
						<button onClick={showGotoPopup}>
							{pg}: {pageIndex + 1}
						</button>
					)}
				</FormattedMessage>
			</div>
		</div>
	);
};

export default AppConsumer(PageFooter);
