import React from "react";
import { withAppContext } from "../../context/App";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSortDown } from "@fortawesome/free-solid-svg-icons";
import { FormattedMessage } from "react-intl";
import QData from "../../services/QData";

const PageHeader = ({ index, appContext }) => {
	const showIndexPopup = e => {
		appContext.setPopup("QIndex");
	};
	const showFindPopup = e => {
		appContext.setPopup("Find");
	};

	const suraIndex = QData.pageSura(index + 1);

	return (
		<div
			className="PageHeader"
			style={{ paddingLeft: appContext.isNarrow ? "50px" : "0" }}
		>
			<button className="SuraTitle" onClick={showIndexPopup}>
				<FormattedMessage id="sura" />
				:&nbsp;<span>{suraIndex + 1}</span>&nbsp;-&nbsp;
				<FormattedMessage id="sura_names">
					{sura_names => {
						return sura_names.split(",")[suraIndex];
					}}
				</FormattedMessage>
				&nbsp;
				<FontAwesomeIcon icon={faSortDown} />
			</button>
			<button className="PartTitle" onClick={showFindPopup}>
				<FormattedMessage id="part" />
				:&nbsp;<span>{QData.pagePart(index + 1)}</span>&nbsp;
				<FontAwesomeIcon icon={faSortDown} />
			</button>
		</div>
	);
};

export default withAppContext(PageHeader);
