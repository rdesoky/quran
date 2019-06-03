import React from "react";
import "./Page.scss";

function Page(props) {
	let imageName = NumToString(props.number + 1);

	return (
		<div className="Page">
			<img
				src={"http://www.egylist.com/qpages_800/page" + imageName + ".png"}
			/>
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
