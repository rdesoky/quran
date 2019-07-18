import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { withAppContext } from "../../context/App";

import "./Modal.scss";

const Modal = ({ onClose, children, appContext }) => {
	const onClickClose = e => {
		if (typeof onClose === "function") {
			onClose(e);
		}
		appContext.setPopup(null);
		e.preventDefault();
	};

	const cancelClose = e => {
		e.stopPropagation();
	};

	let activeSide = appContext.getActiveSide();

	return (
		<>
			<div
				className="ModalOverlay"
				style={{
					left: appContext.isNarrow ? 0 : 50
				}}
				onClick={onClickClose}
			>
				<div
					style={{
						left: activeSide === 0 ? 0 : "50%",
						right: activeSide === 0 && appContext.pagesCount === 2 ? "50%" : 0
					}}
					className="ModalContent"
					onClick={cancelClose}
				>
					{children}
					<button className="CancelButton" onClick={onClickClose}>
						<FontAwesomeIcon icon={faTimes} />
					</button>
				</div>
			</div>
		</>
	);
};

export default withAppContext(Modal);
