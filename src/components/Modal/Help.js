import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import Utils from "../../services/utils";
import QData from "../../services/QData";
import { FormattedMessage } from "react-intl";
import { withAppContext } from "../../context/App";

const Help = () => {
	return (
		<>
			<div className="Title">
				<FormattedMessage id="help" />
			</div>
		</>
	);
};

export default withAppContext(Help);
