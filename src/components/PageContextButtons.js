import React from "react";
import { useSelector } from "react-redux";
import { AudioState, selectAudioState } from "../store/playerSlice";
import { CommandButton } from "./Modal/Commands";
import { PageNavigator } from "./PageNavigator";

export const PageContextButtons = ({ page }) => {
    const audioState = useSelector(selectAudioState);
    return (
        <PageNavigator trigger="page_context">
            <div className="IconsBar">
                {/* <CommandButton trigger="page_context" command="Mask" /> */}
                <CommandButton trigger="page_context" command="Goto" />
                {audioState === AudioState.stopped ? (
                    <CommandButton trigger="page_context" command="Play" />
                ) : (
                    <CommandButton trigger="page_context" command="Stop" />
                )}
                <CommandButton trigger="page_context" command="update_hifz" />
            </div>
        </PageNavigator>
    );
};
