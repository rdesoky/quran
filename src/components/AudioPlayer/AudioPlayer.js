import React, { useEffect, useState } from "react";
import "./AudioPlayer.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faTh,
	faAngleDoubleDown,
	faAngleDoubleUp
} from "@fortawesome/free-solid-svg-icons";
import { withAppContext } from "../../context/App";

function AudioPlayer(props) {
	return <div id="xaudio-player">Audio Player</div>;
}

export default withAppContext(AudioPlayer);
