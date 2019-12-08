import React, { Component, useContext } from "react";
import "./AudioPlayer.scss";
import { AppConsumer, AppContext } from "../../context/App";
import { AudioState, PlayerContext } from "../../context/Player";
import QData from "./../../services/QData";
import { FormattedMessage as String } from "react-intl";
import { CommandButton } from "./../Modal/Commands";

const PlayerButtons = ({
    showReciter,
    showLabels,
    trigger = "player_buttons"
}) => {
    const player = useContext(PlayerContext);

    let playButton = null,
        stopBtn = null;

    if (player.audioState !== AudioState.stopped) {
        stopBtn = (
            <CommandButton
                trigger={trigger}
                command="Stop"
                showLabel={showLabels}
            />
        );
    }

    switch (player.audioState) {
        case AudioState.paused:
            playButton = (
                <CommandButton
                    trigger={trigger}
                    command="Pause"
                    className="blinking"
                    showLabel={showLabels}
                />
            );
            break;
        case AudioState.playing:
            playButton = (
                <CommandButton
                    trigger={trigger}
                    command="Pause"
                    showLabel={showLabels}
                />
            );
            break;
        case AudioState.buffering:
            playButton = (
                <CommandButton
                    trigger={trigger}
                    command="Downloading"
                    className="blinking"
                    showLabel={showLabels}
                />
            );
            break;
        default:
            playButton = (
                <CommandButton
                    trigger={trigger}
                    command="Play"
                    showLabel={showLabels}
                />
            );
    }

    const reciterButton =
        showReciter === false || player.audioState === AudioState.stopped ? (
            ""
        ) : (
            <CommandButton
                trigger={trigger}
                command="AudioPlayer"
                showLabel={showLabels}
            />
        );

    return (
        <div className="PlayerButtons">
            {reciterButton}
            {playButton} {stopBtn}
        </div>
    );
};

const PlayerStatus = () => {
    const app = useContext(AppContext);
    const player = useContext(PlayerContext);
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
                    return sura_names.split(",")[sura] + " (" + (aya + 1) + ")";
                }}
            </String>
        </button>
    );
};

export { PlayerButtons, PlayerStatus };
