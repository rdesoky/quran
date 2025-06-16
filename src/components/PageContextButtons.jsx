import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "@/hooks/useHistory";
import { getPageFirstAyaId } from "../services/qData";
import { gotoAya, selectMaskOn, showMask } from "../store/navSlice";
import { AudioState, selectAudioState } from "../store/playerSlice";
import { AudioRange } from "../store/settingsSlice";
import { CommandButton } from "./CommandButton";

export const PageContextButtons = ({ page }) => {
    const audioState = useSelector(selectAudioState);
    const dispatch = useDispatch();
    const isMaskOn = useSelector(selectMaskOn);
    const history = useHistory();

    const trigger = "page_context";

    return (
        <div className="IconsBar">
            <CommandButton
                {...{
                    trigger,
                    command:
                        audioState === AudioState.stopped ? "Play" : "Stop",
                    audioRepeat: AudioRange.page,
                    playAya: getPageFirstAyaId(page),
                }}
            />
            <CommandButton {...{ trigger, command: "update_hifz" }} />
            {!isMaskOn && (
                <CommandButton
                    {...{
                        trigger,
                        command: "Mask",
                        onClick: () => {
                            dispatch(
                                gotoAya(history, getPageFirstAyaId(page), {
                                    sel: true,
                                })
                            );
                            dispatch(showMask());
                        },
                    }}
                />
            )}
            <CommandButton {...{ trigger, command: "Goto" }} />
        </div>
    );
};
