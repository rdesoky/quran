import React, { Component } from "react";
import { AppConsumer } from "./App";
import QData from "./../services/QData";
import Utils from "./../services/utils";

const AudioState = {
  stopped: 0,
  playing: 1,
  paused: 2,
  buffering: 3,
  error: 4
};

const PlayerContextState = {
  visible: false,
  audioState: AudioState.stopped,
  playingAya: -1,
  followPlayer: true,
  repeat: 0,
  rangeStart: -1,
  rangeEnd: -1,
  rangeType: 0,
  reciter: "baset" //TODO: read from localStorage
};

//Create the PlayerContext hash object {Provider, Consumer}
const PlayerContext = React.createContext(PlayerContextState);

//Define single provider component class
class PlayerProvider extends Component {
  state = PlayerContextState;

  show = show => {
    //this.setState({ visible: show !== false });
    this.props.app.setPopup("AudioPlayer");
  };

  setPlayingAya = playingAya => {
    this.setState({ playingAya });
    return playingAya;
  };

  setAudioState = audioState => {
    this.setState({ audioState });
    return audioState;
  };

  offsetPlayingAya = offset => {
    //TODO: validate aya
    const playingAya = this.state.playingAya + offset;
    this.setState({ playingAya });
    return playingAya;
  };

  audioSource = ayaId => {
    const { sura, aya } = QData.ayaIdInfo(
      ayaId !== undefined ? ayaId : this.state.playingAya
    );
    const fileName =
      Utils.num2string(sura + 1, 3) + Utils.num2string(aya + 1, 3);
    return `http://www.everyayah.com/data/Abdul_Basit_Murattal_192kbps/${fileName}.mp3`;
  };

  play = () => {
    const { app } = this.props;
    const playingAya =
      this.state.playingAya == -1
        ? this.setPlayingAya(app.selectStart)
        : this.state.playingAya;

    this.audio.src = this.audioSource(playingAya);
    this.audio.play();
    //this.show();
  };
  resume = () => {
    this.audio.play();
    // this.show();
  };
  stop = event => {
    this.audio.pause();
    this.setAudioState(AudioState.stopped);
    this.setPlayingAya(-1);
  };

  pause = () => {
    this.audio.pause();
  };

  methods = {
    show: this.show,
    setAudioState: this.setAudioState,
    setPlayingAya: this.setPlayingAya,
    offsetPlayingAya: this.offsetPlayingAya,
    play: this.play,
    pause: this.pause,
    resume: this.resume,
    stop: this.stop
  };

  componentDidMount() {
    const audio = (this.audio = document.createElement("audio"));
    audio.addEventListener("volumechange", this.onVolumeChange);
    audio.addEventListener("ended", this.onEnded);
    audio.addEventListener("playing", this.onPlaying);
    audio.addEventListener("waiting", this.onWaiting);
    audio.addEventListener("pause", this.onPaused);
    // document.addEventListener("keydown", this.handleKeyDown);
  }

  componentWillUnmount() {
    const audio = this.audio;
    // document.removeEventListener("keydown", this.handleKeyDown);
    audio.removeEventListener("ended", this.onEnded);
    audio.removeEventListener("volumechange", this.onVolumeChange);
    audio.removeEventListener("playing", this.onPlaying);
    audio.removeEventListener("waiting", this.onWaiting);
    audio.removeEventListener("pause", this.onPaused);
  }

  onEnded = ({ target: audio }) => {
    const { app } = this.props;
    if (this.state.audioState !== AudioState.stopped) {
      const ayaId = this.offsetPlayingAya(1);
      this.play();
      if (this.state.followPlayer) {
        app.gotoAya(ayaId, { sel: true });
      }
    }
  };

  onVolumeChange = ({ target: audio }) => {
    // this.setVolume(audio.volume);
    // this.setMuted(audio.muted);
  };

  onPlaying = event => {
    this.setAudioState(AudioState.playing);
  };

  onWaiting = event => {
    this.setAudioState(AudioState.buffering);
  };

  onPaused = event => {
    if (AudioState.stopped !== this.state.audioState) {
      this.setAudioState(AudioState.paused);
    }
  };

  render() {
    return (
      <PlayerContext.Provider
        value={{
          audio: this.audio,
          ...this.props,
          ...this.state,
          ...this.methods
        }}
      >
        {this.props.children}
      </PlayerContext.Provider>
    );
  }
}

//define consumers generator function
const PlayerConsumer = Component =>
  function PlayerConsumerGen(props) {
    return (
      <PlayerContext.Consumer>
        {state => <Component {...props} player={state} />}
      </PlayerContext.Consumer>
    );
  };

export default AppConsumer(PlayerProvider);
export { PlayerConsumer, AudioState };
