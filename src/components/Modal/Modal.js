import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { withAppContext } from "../../context/App";

import "./Modal.scss";

const Modal = ({ open, onClose, children, appContext }) => {
	const onClickClose = e => {
		appContext.setPopup(null);
		e.preventDefault();
	};

	const cancelClose = e => {
		e.stopPropagation();
	};

	return (
		<>
			<div className="ModalOverlay" onClick={onClickClose} />
			<div
				style={{
					left: (appContext.isNarrow ? 0 : 50).toString() + "px"
				}}
				className="ModalContent"
				onClick={cancelClose}
			>
				{children}
			</div>
			<button className="CancelButton" onClick={onClickClose}>
				<FontAwesomeIcon icon={faTimes} />
			</button>
		</>
	);
};

export default withAppContext(Modal);
