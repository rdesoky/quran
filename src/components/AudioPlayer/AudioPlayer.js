import React, { Component } from "react";
import "./AudioPlayer.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faTh,
	faAngleDoubleDown,
	faAngleDoubleUp
} from "@fortawesome/free-solid-svg-icons";
import { withAppContext } from "../../context/App";
import Modal from "../Modal/Modal";
import QData from "./../../services/QData";
import Utils from "./../../services/utils";
import { FormattedMessage } from "react-intl";

const PlayerState = {
	stopped: 0,
	playing: 1,
	paused: 2,
	buffering: 3,
	error: 4
};

class AudioPlayer extends Component {
	state = { audioState: PlayerState.stopped };
	player;
	playingAya;

	constructor(props) {
		super(props);
		this.player = document.createElement("audio");
	}

	audioSource() {
		const { appContext } = this.props;

		// const { sura, aya } = QData.ayaIdInfo(appContext.playingAya);
		const { sura, aya } = QData.ayaIdInfo(appContext.selectStart);
		const fileName =
			Utils.num2string(sura + 1, 3) + Utils.num2string(aya + 1, 3);
		return `http://www.everyayah.com/data/Abdul_Basit_Murattal_192kbps/${fileName}.mp3`;
	}

	onEnded = ({ target: player }) => {
		const { appContext } = this.props;
		//const ayaId = appContext.offsetPlayingAya(1);
		if (this.playingAya === appContext.selectStart) {
			const ayaId = appContext.offsetSelection(1);
			appContext.gotoAya(ayaId);
		}
		this.play();
	};

	onVolumeChange = ({ target: player }) => {
		this.setVolume(player.volume);
		this.setMuted(player.muted);
	};

	onPlaying = event => {
		this.setState({ audioState: PlayerState.playing });
	};

	onWaiting = event => {
		this.setState({ audioState: PlayerState.buffering });
	};

	onPaused = event => {
		if (PlayerState.stopped !== this.state.audioState) {
			this.setState({ audioState: PlayerState.paused });
		}
	};

	componentDidMount() {
		this.playingAya = this.props.appContext.selectStart;
		const player = this.player;
		player.addEventListener("volumechange", this.onVolumeChange);
		player.addEventListener("ended", this.onEnded);
		player.addEventListener("playing", this.onPlaying);
		player.addEventListener("waiting", this.onWaiting);
		player.addEventListener("pause", this.onPaused);
	}

	componentDidUnmount() {
		const player = this.player;
		player.removeEventListener("ended", this.onEnded);
		player.removeEventListener("volumechange", this.onVolumeChange);
		player.removeEventListener("playing", this.onPlaying);
		player.removeEventListener("waiting", this.onWaiting);
		player.removeEventListener("pause", this.onPaused);
	}
	render() {
		const { appContext } = this.props;
		const audioState = this.state.audioState;
		return (
			<Modal
				onClose={this.onClose}
				show={appContext.playerVisible}
				name="AudioPlayer"
				modeless={true}
			>
				<div className="Title">
					{[PlayerState.paused].includes(audioState) ? (
						<button onClick={this.resume}>|&lt;</button>
					) : (
						""
					)}
					{[PlayerState.stopped].includes(audioState) ? (
						<button onClick={this.play}>&lt;</button>
					) : (
						""
					)}
					{[PlayerState.playing, PlayerState.buffering].includes(audioState) ? (
						<button onClick={this.pause}>||</button>
					) : (
						""
					)}
					{PlayerState.stopped !== audioState ? (
						<button onClick={this.stop}>X</button>
					) : (
						""
					)}
				</div>
				<div>
					{/* <audio
						controls
						id="AudioPlayer"
						ref={ref => {
							this.player = ref;
						}}
						src={this.audioSource()}
					/> */}
				</div>
				<div>{this.renderState()}</div>
			</Modal>
		);
	}

	renderState = () => {
		let { sura, aya } = QData.ayaIdInfo(this.playingAya);
		let audioState = "unknown";
		switch (this.state.audioState) {
			case PlayerState.stopped:
				audioState = "stopped";
				break;
			case PlayerState.buffering:
				audioState = "buffering";
				break;
			case PlayerState.playing:
				audioState = "playing";
				break;
			case PlayerState.paused:
				audioState = "paused";
				break;
			case PlayerState.error:
				audioState = "error";
				break;
			default:
				break;
		}
		return (
			<>
				<FormattedMessage id={audioState} />
				:&nbsp;
				<FormattedMessage id="sura_names">
					{sura_names => {
						return sura_names.split(",")[sura] + "-" + (aya + 1);
					}}
				</FormattedMessage>
			</>
		);
	};

	onClose = () => {
		const { appContext } = this.props;
		appContext.showPlayer(false);
	};
	play = event => {
		const { appContext } = this.props;
		this.player.src = this.audioSource();
		this.player.play();
		this.playingAya = appContext.selectStart;
	};
	resume = event => {
		this.player.play();
	};
	stop = event => {
		this.player.pause();
		this.setState({ audioState: PlayerState.stopped });
	};

	pause = event => {
		this.player.pause();
	};
}

export default withAppContext(AudioPlayer);
