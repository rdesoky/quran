import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { withAppContext } from "../../context/AppProvider";

import "./Modal.scss";

const Modal = ({ open, onClose, children, appContext }) => {
	const [isOpen, updateIsOpen] = useState(open);

	useEffect(() => {
		updateIsOpen(open);
	}, [open]);

	const onClickClose = e => {
		updateIsOpen(false);
		if (typeof onClose === "function") {
			onClose();
		}
		e.preventDefault();
	};

	const cancelClose = e => {
		e.stopPropagation();
	};

	return (
		<>
			<div
				className="ModalOverlay"
				style={{ display: isOpen ? "fixed" : "none" }}
				onClick={onClickClose}
			/>
			<div
				style={{
					display: isOpen ? "fixed" : "none",
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
