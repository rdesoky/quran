import React from "react";
import "./Spinner.css";

function Spinner(props) {
	return (
		<div
			className="Spinner"
			style={{ visibility: props.visible ? "visible" : "hidden" }}
		>
			<div />
			<div />
			<div />
			<div />
		</div>
	);
}

export default Spinner;
