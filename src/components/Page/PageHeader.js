import React from "react";
import { withAppContext } from "../../context/App";
import { FormattedMessage } from "react-intl";
import QData from "../../services/QData";
import Utils from "../../services/utils";

const PageHeader = ({ index: pageIndex, appContext, order }) => {
	// const showIndexPopup = e => {
	// 	appContext.setPopup("QIndex");
	// };
	// const showFindPopup = e => {
	// 	appContext.setPopup("Find");
	// };

	const onSelectSura = ({ target }) => {
		appContext.hideMask();
		const suraIndex = parseInt(target.value);
		appContext.gotoSura(suraIndex);
		Utils.selectTopCommand();
	};

	const onSelectPart = ({ target }) => {
		appContext.hideMask();
		const partIndex = target.value;
		appContext.gotoPart(partIndex);
		Utils.selectTopCommand();
	};

	const showFindPopup = e => {
		appContext.setPopup("Find");
	};

	const suraIndex = QData.pageSura(pageIndex + 1);
	let textAlign =
		appContext.pagesCount === 1 ? "center" : order === 0 ? "left" : "right";

	let partIndex = QData.pagePart(pageIndex + 1) - 1;

	return (
		<div className="PageHeader" style={{ textAlign }}>
			<div
				style={{
					width: appContext.pageWidth(),
					margin: appContext.pageMargin()
				}}
				className="PageHeaderContent"
			>
				<select className="SuraTitle" onChange={onSelectSura} value={suraIndex}>
					<FormattedMessage className="SuraTitle" id="sura_names">
						{sura_names => {
							return sura_names.split(",").map((name, index) => {
								return (
									<option value={index} key={index}>
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
					value={partIndex}
					style={{ left: appContext.isNarrow ? "50px" : "0" }}
				>
					<FormattedMessage id="part">
						{partLabel => {
							let parts = new Array(30).fill("");
							return parts.map((item, index) => {
								return (
									<option key={index} value={index}>
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
