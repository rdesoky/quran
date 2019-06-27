import React from "react";
import { withAppContext } from "../../context/App";
import { FormattedMessage } from "react-intl";

const PageFooter = ({ index: pageIndex, appContext, order }) => {
	const showFindPopup = e => {
		appContext.setPopup("Find");
	};

	let textAlign =
		appContext.pagesCount === 1 ? "center" : order === 0 ? "left" : "right";

	return (
		<div className="PageFooter" style={{ textAlign }}>
			<div
				style={{
					width: appContext.pageWidth(),
					margin: appContext.pageMargin()
				}}
				className="PageHeaderContent"
			>
				<FormattedMessage id="pg">
					{pg => (
						<button onClick={showFindPopup}>
							{pg}: {pageIndex + 1}
						</button>
					)}
				</FormattedMessage>
			</div>
		</div>
	);
};

export default withAppContext(PageFooter);
