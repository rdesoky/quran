import React from "react";
import { useSelector } from "react-redux";
import { selectMaskOn } from "../store/navSlice";
import { AudioState, selectAudioState } from "../store/playerSlice";
import { AudioRepeat } from "../store/settingsSlice";
import { selectPopup } from "../store/uiSlice";
import { CommandButton } from "./CommandButton";

export const VerseContextButtons = ({ verse }) => {
    const audioState = useSelector(selectAudioState);
    const popup = useSelector(selectPopup);
    const isMaskOn = useSelector(selectMaskOn);
    const trigger = "verse_context";

    return (
        <div className="IconsBar">
            {audioState === AudioState.stopped ? (
                <CommandButton
                    {...{
                        trigger,
                        command: "Play",
                        audioRepeat: AudioRepeat.selection,
                    }}
                />
            ) : (
                <CommandButton trigger="verse_context" command="Stop" />
            )}
            {popup !== "Tafseer" ? (
                <CommandButton trigger="verse_context" command="Tafseer" />
            ) : null}
            {!isMaskOn && (
                <CommandButton trigger="verse_context" command="Mask" />
            )}
            <CommandButton trigger="verse_context" command="Copy" />
            <CommandButton trigger="verse_context" command="Bookmark" />
        </div>
    );
};
