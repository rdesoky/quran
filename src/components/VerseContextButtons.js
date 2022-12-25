import React from "react";
import { useSelector } from "react-redux";
import { selectMaskOn } from "../store/navSlice";
import { AudioState, selectAudioState } from "../store/playerSlice";
import { selectPopup } from "../store/uiSlice";
import { CommandButton } from "./CommandButton";

export const VerseContextButtons = ({ verse }) => {
    const audioState = useSelector(selectAudioState);
    const popup = useSelector(selectPopup);
    const isMaskOn = useSelector(selectMaskOn);

    return (
        <div className="IconsBar">
            {audioState === AudioState.stopped ? (
                <CommandButton trigger="verse_context" command="Play" />
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
