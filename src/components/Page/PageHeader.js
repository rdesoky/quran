import React from "react";
import { withAppContext } from "../../context/App";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSortDown } from "@fortawesome/free-solid-svg-icons";
import { FormattedMessage } from "react-intl";
import QData from "../../services/QData";

const PageHeader = ({ index: pageIndex, appContext }) => {
	// const showIndexPopup = e => {
	// 	appContext.setPopup("QIndex");
	// };
	// const showFindPopup = e => {
	// 	appContext.setPopup("Find");
	// };

	const onSelectSura = ({ target }) => {
		const suraIndex = target.value;
		appContext.gotoSura(suraIndex);
	};

	const onSelectPart = ({ target }) => {
		const partIndex = target.value;
		appContext.gotoPart(partIndex);
	};

	const suraIndex = QData.pageSura(pageIndex + 1);

	return (
		<div className="PageHeader">
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
	);
};

export default withAppContext(PageHeader);
