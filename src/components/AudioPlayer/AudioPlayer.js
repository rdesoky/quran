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
import { FormattedMessage as String } from "react-intl";
import ReciterName from "./ReciterName";
import { ListReciters } from "./../../services/AudioData";
import Switch from "react-switch";

class AudioPlayer extends Component {
    audio;
    // playingAya;

    constructor(props) {
        super(props);
        this.audio = document.createElement("audio");
    }

    handleKeyDown = e => {
        const { tagName, type } = document.activeElement;
        const isInput = ["INPUT", "BUTTON", "TEXTAREA"].includes(tagName);
        const isTextInput =
            isInput && ["text", "number", "textarea"].includes(type);
        if (isTextInput) {
            return;
        }
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

    onChangeRepeat = ({ currentTarget }) => {
        const repeat = currentTarget.value;
        this.props.player.setRepeat(parseInt(repeat));
    };

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
                <String id={stateId} />
                :&nbsp;
                <String id="sura_names">
                    {sura_names => {
                        return (
                            sura_names.split(",")[sura] + " (" + (aya + 1) + ")"
                        );
                    }}
                </String>
            </button>
        );
    };

    gotoPlayingAya = event => {
        const { app, player } = this.props;
        const { selectStart } = app;
        const { playingAya } = player;
        const ayaId = playingAya !== -1 ? playingAya : selectStart;
        app.gotoAya(ayaId, { sel: false });
    };

    onClose = () => {
        // const { player } = this.props;
        // player.show(false);
        this.props.app.closePopup();
    };

    selectReciter = ({ currentTarget }) => {
        const reciter = currentTarget.getAttribute("reciter");
        this.props.player.changeReciter(reciter);
    };

    updateFollowPlayer = checked => {
        this.props.player.setFollowPlayer(checked);
    };

    render() {
        const { app, player } = this.props;
        return (
            <>
                <div className="Title">
                    <div id="PlayerStatus">{this.renderState()}</div>
                </div>
                <div
                    className="PopupBody"
                    style={{
                        maxHeight: app.appHeight - 105 - (app.isNarrow ? 25 : 0)
                    }}
                >
                    <div className="OptionRow">
                        <label>
                            <String id="repeat" />
                            <select
                                onChange={this.onChangeRepeat}
                                value={player.repeat}
                            >
                                <String id="no_repeat">
                                    {label => (
                                        <option value={0}>{label}</option>
                                    )}
                                </String>
                                <String id="selection">
                                    {label => (
                                        <option value={1}>{label}</option>
                                    )}
                                </String>
                                <String id="page">
                                    {label => (
                                        <option value={2}>{label}</option>
                                    )}
                                </String>
                                <String id="sura">
                                    {label => (
                                        <option value={3}>{label}</option>
                                    )}
                                </String>
                                <String id="part">
                                    {label => (
                                        <option value={4}>{label}</option>
                                    )}
                                </String>
                            </select>
                        </label>
                    </div>
                    <div className="OptionRow">
                        <label>
                            <span>
                                <String id="followPlayer" />
                            </span>
                            <Switch
                                height={22}
                                width={42}
                                onChange={this.updateFollowPlayer}
                                checked={player.followPlayer}
                                // disabled={player.repeat == 1}
                            />
                        </label>
                    </div>
                    <div className="RecitersList">
                        {ListReciters("ayaAudio").map(reciter => {
                            return (
                                <div
                                    reciter={reciter}
                                    key={reciter}
                                    className={
                                        "ReciterButton" +
                                        (player.reciter === reciter
                                            ? " Selected"
                                            : "")
                                    }
                                    onClick={this.selectReciter}
                                >
                                    <img
                                        className="ReciterIcon"
                                        src={
                                            process.env.PUBLIC_URL +
                                            "/images/" +
                                            reciter +
                                            ".jpg"
                                        }
                                    />
                                    <div>
                                        <ReciterName id={reciter} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </>
        );
    }
}

export default AppConsumer(PlayerConsumer(AudioPlayer));
