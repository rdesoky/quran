import React from "react";
import { withAppContext } from "../../context/App";
import { FormattedMessage } from "react-intl";
import QData from "../../services/QData";

const PageHeader = ({ index: pageIndex, appContext, order }) => {
	// const showIndexPopup = e => {
	// 	appContext.setPopup("QIndex");
	// };
	// const showFindPopup = e => {
	// 	appContext.setPopup("Find");
	// };

	const onSelectSura = ({ target }) => {
		appContext.hideMask();
		const suraIndex = target.value;
		appContext.gotoSura(suraIndex);
	};

	const onSelectPart = ({ target }) => {
		appContext.hideMask();
		const partIndex = target.value;
		appContext.gotoPart(partIndex);
	};

	const showFindPopup = e => {
		appContext.setPopup("Find");
	};

	const suraIndex = QData.pageSura(pageIndex + 1);
	let textAlign =
		appContext.pagesCount === 1 ? "center" : order === 0 ? "left" : "right";

	return (
		<div className="PageHeader" style={{ textAlign }}>
			<div
				style={{
					width: appContext.pageWidth(),
					margin: appContext.pageMargin()
				}}
				className="PageHeaderContent"
			>
				<select className="SuraTitle" onChange={onSelectSura}>
					<FormattedMessage className="SuraTitle" id="sura_names">
						{sura_names => {
							return sura_names.split(",").map((name, index) => {
								return (
									<option
										value={index}
										selected={index === suraIndex}
										key={index}
									>
										{(index + 1).toString()}: {name}
									</option>
								);
							});
						}}
					</FormattedMessage>
				</select>
				<select
					onChange={onSelectPart}
					className="PartTitle"
					style={{ left: appContext.isNarrow ? "50px" : "0" }}
				>
					<FormattedMessage id="part">
						{partLabel => {
							let partIndex = QData.pagePart(pageIndex + 1) - 1;
							let parts = new Array(30).fill("");
							return parts.map((item, index) => {
								return (
									<option
										key={index}
										value={index}
										selected={partIndex === index}
									>
										{partLabel}: {(index + 1).toString()}
									</option>
								);
							});
						}}
					</FormattedMessage>
				</select>
			</div>
		</div>
	);
};

export default withAppContext(PageHeader);
