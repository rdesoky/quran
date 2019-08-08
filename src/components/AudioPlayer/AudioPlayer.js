import React, { Component } from "react";
import "./AudioPlayer.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPauseCircle,
  faPlayCircle,
  faStopCircle
} from "@fortawesome/free-solid-svg-icons";
import { AppConsumer } from "../../context/App";
import { PlayerConsumer, AudioState } from "../../context/Player";
import Modal from "../Modal/Modal";
import QData from "./../../services/QData";
import Utils from "./../../services/utils";
import { FormattedMessage } from "react-intl";

class AudioPlayer extends Component {
  audio;
  // playingAya;

  constructor(props) {
    super(props);
    this.audio = document.createElement("audio");
  }

  audioSource(ayaId) {
    const { player } = this.props;

    const { sura, aya } = QData.ayaIdInfo(
      ayaId !== undefined ? ayaId : player.playingAya
    );
    const fileName =
      Utils.num2string(sura + 1, 3) + Utils.num2string(aya + 1, 3);
    return `http://www.everyayah.com/data/Abdul_Basit_Murattal_192kbps/${fileName}.mp3`;
  }

  handleKeyDown = e => {
    switch (e.code) {
      case "KeyP": {
        const { player } = this.props;
        switch (this.props.player.audioState) {
          case AudioState.paused:
            player.resume();
            break;
          case AudioState.stopped:
            player.play();
            break;
          case AudioState.playing:
            player.pause(e);
            break;
          default:
            break;
        }
        this.gotoPlayingAya(e);
      }
    }
  };

  componentDidMount() {
    document.addEventListener("keydown", this.handleKeyDown);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown);
  }

  renderState = () => {
    const { app, player } = this.props;
    const { selectStart } = app;
    const { playingAya, audioState } = player;
    let ayaId = playingAya === -1 ? selectStart : playingAya;
    let { sura, aya } = QData.ayaIdInfo(ayaId);
    let stateId = "unknown";
    switch (audioState) {
      case AudioState.stopped:
        stateId = "stopped";
        break;
      case AudioState.buffering:
        stateId = "buffering";
        break;
      case AudioState.playing:
        stateId = "playing";
        break;
      case AudioState.paused:
        stateId = "paused";
        break;
      case AudioState.error:
        stateId = "error";
        break;
      default:
        break;
    }
    return (
      <button onClick={this.gotoPlayingAya}>
        <FormattedMessage id={stateId} />
        :&nbsp;
        <FormattedMessage id="sura_names">
          {sura_names => {
            return sura_names.split(",")[sura] + " (" + (aya + 1) + ")";
          }}
        </FormattedMessage>
      </button>
    );
  };

  gotoPlayingAya = event => {
    const { app, player } = this.props;
    const { selectStart } = app;
    const { playingAya } = player;
    const ayaId = playingAya !== -1 ? playingAya : selectStart;
    app.gotoAya(ayaId, { sel: true });
    player.show();
  };

  onClose = () => {
    const { player } = this.props;
    player.show(false);
  };

  render() {
    const { player } = this.props;
    const audioState = this.props.player.audioState;
    return (
      <Modal
        onClose={this.onClose}
        show={player.visible}
        name="AudioPlayer"
        modeless={true}
      >
        <img
          id="ReciterIcon"
          src={process.env.PUBLIC_URL + "/images/baset.jpg"}
        />
        <div className="Title">
          <div id="PlayerStatus">{this.renderState()}</div>
        </div>
      </Modal>
    );
  }
}

export default AppConsumer(PlayerConsumer(AudioPlayer));
