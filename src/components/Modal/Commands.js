import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import { withAppContext } from "../../context/App";
import { FormattedMessage } from "react-intl";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

const Commands = ({ open }) => {
	const list = [{ icon: faSearch, command: "Search" }];

	const runCommand = ({ target }) => {
		let command = target.getAttibute("command-id");
		alert(command);
	};

	return (
		<Modal open={open}>
			<div className="Title">
				<FormattedMessage id="index" />
			</div>
			{list.map(item => (
				<button command-id={item.command} onClick={runCommand}>
					<FontAwesomeIcon icon={item.icon} />
				</button>
			))}
		</Modal>
	);
};

export default withAppContext(Commands);
