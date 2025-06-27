import { AudioState, selectAudioState } from "@/store/playerSlice";
import { useSelector } from "react-redux";
import { CommandButton } from "@/components/CommandButton";
import "@/components/AudioPlayer/AudioPlayer.scss";

type PlayerButtonsProps = {
    showReciter?: boolean;
    showLabels?: boolean;
    trigger?: string;
    showHotKeys?: boolean;
    onPlay?: () => void;
    onStop?: () => void;
};

export const PlayerButtons = ({
    showReciter,
    showLabels,
    trigger = "player_buttons",
    showHotKeys = true,
    onPlay,
    onStop,
}: PlayerButtonsProps) => {
    const audioState = useSelector(selectAudioState);

    let playButton = null,
        stopBtn = null;

    if (audioState !== AudioState.stopped && showReciter === false) {
        stopBtn = (
            <CommandButton
                trigger={trigger}
                command="Stop"
                showLabel={showLabels}
                showHotKey={showHotKeys}
                onClick={onStop}
            />
        );
    }

    switch (audioState) {
        case AudioState.paused:
            playButton = (
                <CommandButton
                    trigger={trigger}
                    command="Resume"
                    showHotKey={showHotKeys}
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
                    showHotKey={showHotKeys}
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
                    showHotKey={showHotKeys}
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
                    showHotKey={showHotKeys}
                    onClick={onPlay}
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
