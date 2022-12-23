import React from "react";
import { FormattedMessage as String } from "react-intl";
import { useDispatch, useSelector } from "react-redux";
import { gotoAya, selectStartSelection } from "../../store/navSlice";
import {
    AudioState,
    selectAudioState,
    selectPlayingAya,
} from "../../store/playerSlice";
import { ayaIdInfo } from "./../../services/QData";
import { CommandButton } from "./../Modal/Commands";
import "./AudioPlayer.scss";

const PlayerButtons = ({
    showReciter,
    showLabels,
    trigger = "player_buttons",
}) => {
    const audioState = useSelector(selectAudioState);

    let playButton = null,
        stopBtn = null;

    if (audioState !== AudioState.stopped) {
        stopBtn = (
            <CommandButton
                trigger={trigger}
                command="Stop"
                showLabel={showLabels}
            />
        );
    }

    switch (audioState) {
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
        showReciter === false || audioState === AudioState.stopped ? (
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
    const dispatch = useDispatch();
    const selectStart = useSelector(selectStartSelection);
    const playingAya = useSelector(selectPlayingAya);
    const audioState = useSelector(selectAudioState);

    // const { selectStart } = app;
    // const { playingAya, audioState } = player;
    let ayaId = playingAya === -1 ? selectStart : playingAya;
    let { sura, aya } = ayaIdInfo(ayaId);
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

    const gotoPlayingAya = (e) => {
        dispatch(gotoAya(ayaId, { sel: true }));
    };

    return (
        <button onClick={gotoPlayingAya} className="AudioStatusButton">
            <String id={stateId} />
            :&nbsp;
            <String id="sura_names">
                {(sura_names) => {
                    return sura_names.split(",")[sura] + " (" + (aya + 1) + ")";
                }}
            </String>
        </button>
    );
};

export { PlayerButtons, PlayerStatus };
