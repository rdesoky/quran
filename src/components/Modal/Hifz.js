import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import Utils from "../../services/utils";
import QData from "../../services/QData";
import { FormattedMessage } from "react-intl";
import { AppConsumer } from "../../context/App";

const Hifz = () => {
	return (
		<>
			<div className="Title">
				<FormattedMessage id="favorites" />
			</div>
			<div>Favorites are shown here.</div>
		</>
	);
};

export default AppConsumer(Hifz);
