import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { withAppContext } from "../../context/App";
import Transition from "./../../services/Transition";
import "./Modal.scss";
import Utils from "../../services/utils";

const Modal = ({ onClose, children, appContext }) => {
	const onClickClose = e => {
		if (typeof onClose === "function") {
			onClose(e);
		}
		//appContext.setPopup(null);
		appContext.closePopup();
		e.preventDefault();
	};

	const cancelClose = e => {
		e.stopPropagation();
	};

	let activeSide = appContext.getActiveSide();

	useEffect(() => {
		const commandBtn = document.querySelector(
			`#RecentCommands button[command=${appContext.popup}]`
		);
		if (commandBtn) {
			commandBtn.focus();
		}
		return () => {
			Utils.selectTopCommand();
		};
	}, []);

	return (
		<Transition>
			<div
				className="ModalOverlay"
				style={{
					left: appContext.isNarrow ? 0 : 50,
					pointerEvents:
						appContext.pagesCount > 1 || appContext.showPopup === false
							? "none"
							: "fill"
				}}
				onClick={onClickClose}
			>
				<div
					style={{
						left: activeSide === 0 ? 0 : "50%",
						right: activeSide === 0 && appContext.pagesCount === 2 ? "50%" : 0
					}}
					className={
						"ModalContent" +
						(appContext.showPopup === false ? " HiddenPopup" : "")
					}
					onClick={cancelClose}
				>
					{children}
					<button className="CancelButton" onClick={onClickClose}>
						<FontAwesomeIcon icon={faTimes} />
					</button>
				</div>
			</div>
		</Transition>
	);
};

export default withAppContext(Modal);
