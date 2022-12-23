import React from "react";
import { useSelector } from "react-redux";
import { AudioState, selectAudioState } from "../store/playerSlice";
import { selectPopup } from "../store/uiSlice";
import { CommandButton } from "./Modal/Commands";

export const VerseContextButtons = ({ verse }) => {
    const audioState = useSelector(selectAudioState);
    const popup = useSelector(selectPopup);

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
            <CommandButton trigger="verse_context" command="Mask" />
            <CommandButton trigger="verse_context" command="Copy" />
            <CommandButton trigger="verse_context" command="Bookmark" />
        </div>
    );
};
