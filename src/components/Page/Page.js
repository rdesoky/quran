import React, { useState, useEffect } from "react";
import "./Page.scss";
import Spinner from "../Spinner/Spinner";

function Page(props) {
	let imageName = NumToString(props.number + 1);
	const [isLoaded, updateLoaded] = useState(false);

	const showImage = e => {
		updateLoaded(true);
	};

	//Run upon mounted, props changes
	useEffect(() => {
		//console.log("Page changed to " + props.number);
		updateLoaded(false);
	}, [props.number]);

	return (
		<div className="Page">
			<div className="PageHeader">Part -- Sura</div>
			<Spinner visible={!isLoaded} />
			<div className="PageFrame">
				<img
					style={{ visibility: isLoaded ? "visible" : "hidden" }}
					onLoad={showImage}
					src={"http://www.egylist.com/qpages_800/page" + imageName + ".png"}
					alt={"Page #" + props.number + 1}
				/>
			</div>
			<div className="PageFooter">{props.number + 1}</div>
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

export default Page;
