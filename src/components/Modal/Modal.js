import React, { useState, useEffect } from "react";
import "./Modal.scss";

const Modal = ({ open, onClose, children }) => {
	const [isOpen, updateIsOpen] = useState(open);

	useEffect(() => {
		updateIsOpen(open);
	}, [open]);

	const onClickClose = e => {
		updateIsOpen(false);
		if (typeof onClose === "function") {
			onClose();
		}
	};

	const cancelClose = e => {
		e.stopPropagation();
	};

	return (
		<div
			className="ModalOverlay"
			style={{ display: isOpen ? "fixed" : "none" }}
			onClick={onClickClose}
		>
			<div className="ModalContent" onClick={cancelClose}>
				{children}
			</div>
		</div>
	);
};

export default Modal;
