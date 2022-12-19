import React, { Component } from "react";
import { AppConsumer } from "./App";
import {
  ayaID,
  ayaIdInfo,
  ayaIdPage,
  getPartIndexByAyaId,
  getPageFirstAyaId,
  getPartFirstAyaId,
  TOTAL_VERSES,
} from "./../services/QData";
// import Utils from "./../services/utils";
import { GetAudioURL, ListReciters } from "./../services/AudioData";

const AudioState = {
  stopped: 0,
  playing: 1,
  paused: 2,
  buffering: 3,
  error: 4,
};

const AudioRepeat = {
  noStop: 0,
  selection: 1,
  page: 2,
  sura: 3,
  part: 4,
  verse: 5,
};

const PlayerContextState = {
  visible: false,
  audioState: AudioState.stopped,
  playingAya: -1,
  followPlayer: JSON.parse(localStorage.getItem("followPlayer") || "true"),
  repeat: parseInt(localStorage.getItem("repeat") || "0"),
  rangeStart: -1,
  rangeEnd: -1,
  rangeType: 0,
  reciter: localStorage.getItem("reciter") || ListReciters()[0],
};

//Create the PlayerContext hash object {Provider, Consumer}
const PlayerContext = React.createContext(PlayerContextState);

//Define single provider component class
class PlayerProvider extends Component {
  state = PlayerContextState;

  show = (show) => {
    //this.setState({ visible: show !== false });
    this.props.app.setPopup("AudioPlayer");
  };

  setPlayingAya = (playingAya) => {
    this.setState({ playingAya });
    return playingAya;
  };

  setAudioState = (audioState) => {
    this.setState({ audioState });
    return audioState;
  };

  offsetPlayingAya = (offset) => {
    let playingAya = this.state.playingAya;
    if (playingAya + offset >= TOTAL_VERSES) {
      return;
    }

    switch (this.state.repeat) {
      case AudioRepeat.verse: //single aya
        this.stop();
        return playingAya;
      case AudioRepeat.selection: //selection
        playingAya += offset;
        const selectedRange = this.props.app.selectedRange();
        if (
          playingAya > selectedRange.end ||
          playingAya < selectedRange.start
        ) {
          playingAya = selectedRange.start;
        }
        break;
      case AudioRepeat.page: //page
        const currPage = ayaIdPage(playingAya);
        const nextPage = ayaIdPage(playingAya + offset);
        if (nextPage !== currPage) {
          playingAya = getPageFirstAyaId(currPage);
        } else {
          playingAya += offset;
        }
        break;
      case AudioRepeat.sura: //sura
        const currSura = ayaIdInfo(playingAya).sura;
        const nextSura = ayaIdInfo(playingAya + offset).sura;
        if (currSura !== nextSura) {
          playingAya = ayaID(currSura, 0);
        } else {
          playingAya += offset;
        }
        break;
      case AudioRepeat.part: //part
        const currPart = getPartIndexByAyaId(playingAya);
        const nextPart = getPartIndexByAyaId(playingAya + offset);
        if (currPart !== nextPart) {
          playingAya = getPartFirstAyaId(currPart);
        } else {
          playingAya += offset;
        }
        break;
      default:
        //.noStop
        playingAya += offset;
    }

    if (playingAya < TOTAL_VERSES) {
      this.setState({ playingAya });
    }
    return playingAya;
  };

  audioSource = (ayaId) => {
    const { sura, aya } = ayaIdInfo(
      ayaId !== undefined ? ayaId : this.state.playingAya
    );
    return GetAudioURL(this.state.reciter, sura + 1, aya + 1);
    // const fileName =
    //     Utils.num2string(sura + 1, 3) + Utils.num2string(aya + 1, 3);

    // return `http://www.everyayah.com/data/Abdul_Basit_Murattal_192kbps/${fileName}.mp3`;
  };

  play = () => {
    const { app } = this.props;
    const playingAya =
      this.state.playingAya === -1
        ? this.setPlayingAya(app.selectedRange().start)
        : this.state.playingAya;

    this.audio.setAttribute("src", this.audioSource(playingAya));
    this.audio.play();
    document.title = "Reciting...";
    if (this.state.followPlayer) {
      //TODO: check if url state inside pager
      app.gotoAya(playingAya, {
        sel: false,
        replace: true,
        keepMask: true,
      });
    }

    if (this.state.repeat === AudioRepeat.verse && app.popup !== "Exercise") {
      this.setRepeat(AudioRepeat.noStop);
    }

    app.pushRecentCommand("AudioPlayer");
  };
  resume = () => {
    this.audio.play();
    document.title = "Reciting...";
    // this.show();
  };
  stop = (resetToSelection = false) => {
    this.audio.pause();
    this.setAudioState(AudioState.stopped);
    if (resetToSelection) {
      this.setPlayingAya(-1);
    }
    document.title = "Quran Hafiz";
  };

  pause = () => {
    document.title = "Paused";
    this.audio.pause();
  };

  trackDuration = () => {
    return this.audio.duration;
  };

  trackCurrentTime = () => {
    return this.audio.currentTime;
  };

  trackRemainingTime = () => {
    return this.audio.duration - this.audio.currentTime;
  };

  changeReciter = (reciter) => {
    localStorage.setItem("reciter", reciter);
    this.setState({ reciter });
    const { state } = this;
    switch (state.audioState) {
      case AudioState.paused:
        this.stop();
        break;
      case AudioState.playing:
        setTimeout(() => {
          this.play();
        }, 1);
        break;
      default:
        break;
    }

    let updated_reciters = ListReciters("ayaAudio").filter(
      (r) => r !== reciter
    );

    updated_reciters.splice(0, 0, reciter);
    localStorage.setItem("reciters_ayaAudio", JSON.stringify(updated_reciters));
  };

  setFollowPlayer = (followPlayer) => {
    this.setState({ followPlayer });
    localStorage.setItem("followPlayer", JSON.stringify(followPlayer));
    return this.state.followPlayer;
  };

  setRepeat = (repeat) => {
    this.setState({ repeat });
    localStorage.setItem("repeat", repeat.toString());
    return this.state.repeat;
  };

  methods = {
    audioSource: this.audioSource,
    show: this.show,
    setAudioState: this.setAudioState,
    setPlayingAya: this.setPlayingAya,
    offsetPlayingAya: this.offsetPlayingAya,
    play: this.play,
    pause: this.pause,
    resume: this.resume,
    stop: this.stop,
    changeReciter: this.changeReciter,
    setFollowPlayer: this.setFollowPlayer,
    setRepeat: this.setRepeat,
    trackDuration: this.trackDuration,
    trackCurrentTime: this.trackCurrentTime,
    trackRemainingTime: this.trackRemainingTime,
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

  componentDidUpdate(prevProps, prevState) {
    if (this.props.app.selectStart !== prevProps.app.selectStart) {
      if (
        this.state.playingAya !== -1 &&
        this.state.audioState === AudioState.stopped
      ) {
        this.setPlayingAya(-1);
      }
    }
  }

  onEnded = () => {
    const { audioState } = this.state;
    if (audioState !== AudioState.stopped) {
      this.offsetPlayingAya(1);
      this.play();
    }
  };

  onVolumeChange = () => {
    // this.setVolume(audio.volume);
    // this.setMuted(audio.muted);
  };

  onPlaying = (event) => {
    this.setAudioState(AudioState.playing);
  };

  onWaiting = (event) => {
    this.setAudioState(AudioState.buffering);
  };

  onPaused = (event) => {
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
          ...this.methods,
        }}
      >
        {this.props.children}
      </PlayerContext.Provider>
    );
  }
}

//define consumers generator function

export default AppConsumer(PlayerProvider);
export { PlayerContext, AudioState, AudioRepeat };
