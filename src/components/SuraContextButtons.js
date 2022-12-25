import React, { useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { AppRefs } from "../RefsProvider";
import { ayaID } from "../services/QData";
import { gotoAya, selectMaskOn, showMask } from "../store/navSlice";
import { AudioState, selectAudioState } from "../store/playerSlice";
import { AudioRepeat } from "../store/settingsSlice";
import { CommandButton } from "./CommandButton";

export const SuraContextButtons = ({ sura }) => {
    const audioState = useSelector(selectAudioState);
    const audio = useContext(AppRefs).get("audio");
    const dispatch = useDispatch();
    const history = useHistory();
    const trigger = "sura_context";
    const isMaskOn = useSelector(selectMaskOn);

    return (
        <div className="IconsBar">
            <CommandButton
                {...{
                    trigger,
                    command:
                        audioState === AudioState.stopped ? "Play" : "Stop",
                    onClick:
                        audioState === AudioState.stopped
                            ? () => {
                                  audio.play(ayaID(sura, 0), AudioRepeat.sura);
                              }
                            : null,
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
                                gotoAya(history, ayaID(sura, 0), { sel: true })
                            );
                            dispatch(showMask());
                        },
                    }}
                />
            )}
        </div>
    );
};
