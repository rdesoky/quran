import React, { useState, useEffect } from "react";
import "./Page.scss";
import Spinner from "../Spinner/Spinner";
import { FormattedMessage } from "react-intl";
import QData from "../../services/QData";
import { withAppContext } from "../../context/App";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSortDown } from "@fortawesome/free-solid-svg-icons";

function Page({ number, appContext }) {
	let imageName = NumToString(number + 1);
	const [isLoaded, setIsLoaded] = useState(false);

	const updateLoaded = val => {
		console.log(`updateLoaded(${val})`);
		setIsLoaded(val);
	};

	const onImageLoaded = e => {
		console.log(
			`**onImageLoaded(${parseInt(number) + 1}) (isLoaded=${isLoaded})`
		);
		setTimeout(() => {
			updateLoaded(true); //To help animation timing
		}, 100);
	};

	//Run after componentDidMount, componentDidUpdate, and props update
	useEffect(() => {
		console.log(
			`Page number changed to ${parseInt(number) + 1} (isLoaded=${isLoaded})`
		);
		updateLoaded(false);
	}, [number]); //only run when number changes

	const showFindPopup = e => {
		appContext.setPopup("Find");
	};
	const showIndexPopup = e => {
		appContext.setPopup("QIndex");
	};

	const suraIndex = QData.pageSura(number + 1);

	return (
		<div className="Page">
			<div
				className="PageHeader"
				style={{ paddingLeft: appContext.isNarrow ? "50px" : "0" }}
			>
				<button className="SuraTitle" onClick={showIndexPopup}>
					<FormattedMessage id="sura" />
					:&nbsp;<span>{suraIndex + 1}</span>&nbsp;-&nbsp;
					<FormattedMessage id="sura_names">
						{sura_names => {
							return sura_names[suraIndex];
						}}
					</FormattedMessage>
					&nbsp;
					<FontAwesomeIcon icon={faSortDown} />
				</button>
				<button className="PartTitle" onClick={showFindPopup}>
					<FormattedMessage id="part" />
					:&nbsp;<span>{QData.pagePart(number + 1)}</span>&nbsp;
					<FontAwesomeIcon icon={faSortDown} />
				</button>
			</div>
			<Spinner visible={!isLoaded} />
			<div
				onClick={e => {
					appContext.setShowMenu(false);
				}}
				className="PageFrame"
				style={{ padding: appContext.isNarrow ? "0" : "0 20px" }}
			>
				<img
					style={{ visibility: isLoaded ? "visible" : "hidden" }}
					className={"PageImage" + (isLoaded ? " AnimatePage" : "")}
					onLoad={onImageLoaded}
					src={"http://www.egylist.com/qpages_800/page" + imageName + ".png"}
					alt={"Page #" + (parseInt(number) + 1).toString()}
				/>
			</div>

			<div className="PageFooter">
				<button onClick={showFindPopup}>{number + 1}</button>
			</div>
		</div>
	);
}

function NumToString(number, padding = 3) {
	let padded = number.toString();
	while (padded.length < padding) {
		padded = "0" + padded;
	}
	return padded;
}

export default withAppContext(Page);
