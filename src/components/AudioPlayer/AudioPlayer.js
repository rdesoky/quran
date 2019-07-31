import React, { useEffect, useState } from "react";
import "./AudioPlayer.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faTh,
	faAngleDoubleDown,
	faAngleDoubleUp
} from "@fortawesome/free-solid-svg-icons";
import { withAppContext } from "../../context/App";
import Modal from "../Modal/Modal";

function AudioPlayer({ appContext }) {
	const onClose = () => {
		appContext.showPlayer(false);
	};

	return (
		<Modal onClose={onClose} show={appContext.playerVisible} name="AudioPlayer">
			<div className="Title">Audio Player</div>
		</Modal>
	);
}

export default withAppContext(AudioPlayer);
