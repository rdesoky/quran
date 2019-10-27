import React, { Component } from "react";
import "./AudioPlayer.scss";
import { AppConsumer } from "../../context/App";
import { PlayerConsumer, AudioState } from "../../context/Player";
import QData from "./../../services/QData";
import { FormattedMessage as String } from "react-intl";
import ReciterName from "./ReciterName";
import { ListReciters } from "./../../services/AudioData";
import Switch from "react-switch";
import { CommandButton } from "./../Modal/Commands";
import { VerseInfo } from "./../Widgets";

class AudioPlayer extends Component {
    onChangeRepeat = ({ currentTarget }) => {
        const repeat = currentTarget.value;
        this.props.player.setRepeat(parseInt(repeat));
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
                    {app.isNarrow ? (
                        <>
                            <VerseInfo verse={player.playingAya} />
                            <PlayerButtons showReciter={false} />
                        </>
                    ) : (
                        ""
                    )}
                </div>
                <div
                    className="PopupBody"
                    style={{
                        maxHeight: app.appHeight - 80
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

const PlayerButtons = PlayerConsumer(({ player, showReciter }) => {
    let playButton = null,
        stopBtn = null;

    if (player.audioState !== AudioState.stopped) {
        stopBtn = <CommandButton command="Stop" />;
    }

    switch (player.audioState) {
        case AudioState.paused:
            playButton = <CommandButton command="Pause" className="blinking" />;
            break;
        case AudioState.playing:
            playButton = <CommandButton command="Pause" />;
            break;
        case AudioState.buffering:
            playButton = (
                <CommandButton command="Downloading" className="blinking" />
            );
            break;
        default:
            playButton = <CommandButton command="Play" />;
    }

    const reciterButton =
        showReciter === false || player.audioState === AudioState.stopped ? (
            ""
        ) : (
            <CommandButton command="AudioPlayer" />
        );

    return (
        <>
            {reciterButton}
            {playButton} {stopBtn}
        </>
    );
});

const PlayerStatus = AppConsumer(
    PlayerConsumer(({ app, player }) => {
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

        const gotoPlayingAya = e => {
            app.gotoAya(ayaId, { sel: true });
        };

        return (
            <button onClick={gotoPlayingAya} className="AudioStatusButton">
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
    })
);

export { PlayerButtons, PlayerStatus };

export default AppConsumer(PlayerConsumer(AudioPlayer));
