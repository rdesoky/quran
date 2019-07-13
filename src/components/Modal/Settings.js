import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import Utils from "../../services/utils";
import QData from "../../services/QData";
import { FormattedMessage } from "react-intl";
import { withAppContext } from "../../context/App";

const Settings = (onClose, isOpen) => {
	return (
		<Modal open={isOpen} onClose={onClose}>
			<div className="Title">
				<FormattedMessage id="settings" />
			</div>
		</Modal>
	);
};

export default withAppContext(Settings);
