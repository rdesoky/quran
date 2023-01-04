import React from "react";
import { useSelector } from "react-redux";
import { AudioState, selectAudioState } from "../../store/playerSlice";
import { CommandButton } from "../CommandButton";
import "./AudioPlayer.scss";

export const PlayerButtons = ({
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
