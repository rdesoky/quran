import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import Utils from "../../services/utils";
import QData from "../../services/QData";
import { FormattedMessage } from "react-intl";
import { withAppContext } from "../../context/App";

const Play = () => {
	return (
		<>
			<div className="Title">
				<FormattedMessage id="play" />
			</div>
			<div>
				<button>Play</button>
			</div>
		</>
	);
};

export default withAppContext(Play);
